// CoronaryAtlas contact-form backend — AWS Lambda (Node.js 20.x, ESM).
//
// Receives a JSON POST from the static site's ContactForm, verifies the
// Cloudflare Turnstile token server-side, then sends the message to
// admin@myakme.com via Amazon SES.
//
// The AWS SDK v3 (@aws-sdk/client-ses) ships inside the Node.js 18.x/20.x
// managed Lambda runtimes, so there is nothing to bundle. Deploy this single
// file behind a Lambda Function URL and point NEXT_PUBLIC_CONTACT_ENDPOINT at
// that URL. SES access comes from the function's IAM role — no keys stored.
//
// Environment variables (set on the Lambda; all have safe defaults):
//   TO_EMAIL          recipient            (default admin@myakme.com)
//   FROM_EMAIL        SES-verified sender  (default admin@myakme.com)
//   TURNSTILE_SECRET  Cloudflare secret    (default = Cloudflare TEST secret)
//   ALLOW_ORIGIN      CORS origin          (default https://coronaryatlas.com)

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({}); // region comes from the Lambda's own region

const TO_EMAIL = process.env.TO_EMAIL || "admin@myakme.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "admin@myakme.com";
// Cloudflare's documented "always passes" TEST secret. Replace in production.
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "1x0000000000000000000000000000000AA";
// Comma-separated allowlist of site origins. The response reflects the caller's
// Origin when it is on this list (so multiple domains work behind one endpoint).
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || process.env.ALLOW_ORIGIN ||
  "https://coronaryatlas.com,https://www.coronaryatlas.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": ALLOW_ORIGINS.includes(origin) ? origin : ALLOW_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
});
const reqOrigin = (event) => event?.headers?.origin || event?.headers?.Origin || "";
const json = (statusCode, body, origin) => ({
  statusCode,
  headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  body: JSON.stringify(body),
});

// Trim + hard-cap a field so a submission can't be used to inject huge payloads.
const clean = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export const handler = async (event) => {
  const origin = reqOrigin(event);
  const method = event?.requestContext?.http?.method || event?.httpMethod || "POST";
  if (method === "OPTIONS") return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  if (method !== "POST") return json(405, { error: "Method not allowed" }, origin);

  // --- parse body (Function URLs / API Gateway may base64-encode) ---
  let data;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : (event.body || "{}");
    data = JSON.parse(raw);
  } catch {
    return json(400, { error: "Invalid JSON body" }, origin);
  }

  const token = data["cf-turnstile-response"];
  const message = clean(data.message, 5000);
  if (!token) return json(400, { error: "Missing Turnstile token" }, origin);
  if (!message) return json(400, { error: "Message is required" }, origin);

  // --- verify Turnstile server-side (this is where the secret lives) ---
  try {
    const form = new URLSearchParams();
    form.append("secret", TURNSTILE_SECRET);
    form.append("response", token);
    const srcIp = event?.requestContext?.http?.sourceIp;
    if (srcIp) form.append("remoteip", srcIp);
    const vr = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const verdict = await vr.json();
    if (!verdict.success) return json(403, { error: "Turnstile verification failed", codes: verdict["error-codes"] }, origin);
  } catch (e) {
    return json(502, { error: "Could not reach Turnstile verifier" }, origin);
  }

  // --- compose + send via SES ---
  const type = clean(data.type, 60) || "General feedback";
  const name = clean(data.name, 120);
  const email = clean(data.email, 160);
  const molecule = clean(data.molecule, 160);
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const lines = [
    `Type: ${type}`,
    name && `Name: ${name}`,
    email && `Email: ${email}`,
    molecule && `Suggested molecule: ${molecule}`,
    "",
    message,
  ].filter((x) => x !== false && x !== undefined);

  const cmd = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [TO_EMAIL] },
    // Let admin hit "Reply" and answer the submitter directly (only if valid).
    ReplyToAddresses: emailValid ? [email] : undefined,
    Message: {
      Subject: { Data: `[CoronaryAtlas] ${type}`, Charset: "UTF-8" },
      Body: { Text: { Data: lines.join("\n"), Charset: "UTF-8" } },
    },
  });

  try {
    const res = await ses.send(cmd);
    return json(200, { ok: true, messageId: res.MessageId }, origin);
  } catch (e) {
    console.error("SES send failed:", e?.name, e?.message);
    return json(500, { error: "Email delivery failed" }, origin);
  }
};
