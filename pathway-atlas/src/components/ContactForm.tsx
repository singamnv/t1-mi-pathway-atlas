"use client";
import { useEffect, useRef, useState } from "react";

// Cloudflare Turnstile TEST keys (always pass, no real verification).
// Swap NEXT_PUBLIC_TURNSTILE_SITE_KEY in production for the real site key.
const TEST_SITE_KEY = "1x00000000000000000000AA";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;

// Optional POST endpoint (e.g. a Formspree/Basin form ID URL). If unset, the
// form falls back to composing a mailto: so it still works on a static host.
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || "";
const FALLBACK_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admin@coronaryatlas.com";

type Kind = "molecule" | "feedback";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function ContactForm() {
  const [kind, setKind] = useState<Kind>("molecule");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Load the Turnstile script once and render the widget.
  useEffect(() => {
    const renderWidget = () => {
      if (!widgetRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        theme: "light",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else if (!document.getElementById("cf-turnstile-script")) {
      window.onTurnstileLoad = renderWidget;
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) { setStatus("error"); return; }
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      type: kind === "molecule" ? "Molecule suggestion" : "General feedback",
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      molecule: String(data.get("molecule") || ""),
      message: String(data.get("message") || ""),
      "cf-turnstile-response": token,
    };

    // Path A: a configured POST endpoint (works when one is provided).
    if (FORM_ENDPOINT) {
      setStatus("sending");
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus("sent");
        form.reset();
        window.turnstile?.reset(widgetId.current || undefined);
        setToken("");
      } catch {
        setStatus("error");
      }
      return;
    }

    // Path B (static-host fallback): open a pre-filled email.
    const subject = encodeURIComponent(`[CoronaryAtlas] ${payload.type}`);
    const bodyLines = [
      `Type: ${payload.type}`,
      payload.name && `Name: ${payload.name}`,
      payload.email && `Email: ${payload.email}`,
      payload.molecule && `Suggested molecule: ${payload.molecule}`,
      "",
      payload.message,
    ].filter(Boolean).join("\n");
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
    setStatus("sent");
  }

  const optional = <span style={{ color: "var(--muted-3)" }}>(optional)</span>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      {/* Submission type */}
      <div>
        <span className="field-label">What would you like to send?</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {([["molecule", "Suggest a molecule"], ["feedback", "General feedback"]] as [Kind, string][]).map(([k, label]) => {
            const active = kind === k;
            return (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                aria-pressed={active}
                style={{
                  padding: "9px 16px", borderRadius: 100, fontSize: 14, cursor: "pointer",
                  fontWeight: active ? 600 : 500,
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  color: active ? "#fff" : "var(--text-2)",
                  background: active ? "var(--accent)" : "var(--panel)",
                  transition: "all .15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid-two" style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="field-label" htmlFor="name">Name {optional}</label>
          <input className="field-input" id="name" name="name" type="text" autoComplete="name" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email {optional}</label>
          <input className="field-input" id="email" name="email" type="email" autoComplete="email" />
        </div>
      </div>

      {kind === "molecule" && (
        <div>
          <label className="field-label" htmlFor="molecule">Molecule / gene name</label>
          <input className="field-input" id="molecule" name="molecule" type="text" placeholder="e.g. GDF-15, LOX-1 (OLR1), miR-499…" />
        </div>
      )}

      <div>
        <label className="field-label" htmlFor="message">
          {kind === "molecule" ? "Why should it be included? (evidence, mechanism, references)" : "Your feedback"}
        </label>
        <textarea
          className="field-textarea"
          id="message"
          name="message"
          required
          placeholder={kind === "molecule"
            ? "Briefly describe the molecule's role in the Type 1 MI cascade and any supporting evidence or PMIDs…"
            : "What worked, what didn't, what you'd like to see…"}
        />
      </div>

      {/* Cloudflare Turnstile widget */}
      <div>
        <span className="field-label">Verify you&apos;re human</span>
        <div ref={widgetRef} className="cf-turnstile" />
        <p style={{ fontSize: 11.5, color: "var(--muted-2)", marginTop: 6 }}>
          Protected by Cloudflare Turnstile (test mode).
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button className="btn-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        {status === "sent" && <span style={{ color: "#0f9d58", fontSize: 14, fontWeight: 600 }}>Thanks — your message is on its way.</span>}
        {status === "error" && <span style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}>Please complete the verification and message first.</span>}
      </div>
    </form>
  );
}
