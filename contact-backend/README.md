# CoronaryAtlas contact backend (SES)

The CoronaryAtlas web app is a **static export** — it has no server of its own,
so it cannot call Amazon SES directly (that would require putting AWS
credentials in browser JavaScript, where anyone could read and abuse them).

This folder is the small backend that closes that gap. It is one AWS Lambda
that the contact form POSTs to. The Lambda:

1. verifies the Cloudflare Turnstile token **server-side** (secret never leaves AWS),
2. sends the submission to **admin@thecviu.com** via SES,
3. returns JSON to the form.

SES access comes from the Lambda's **IAM role** — no long-lived access keys are
stored anywhere.

```
static site (ContactForm)  ──POST JSON──▶  Lambda Function URL
                                              │  verify Turnstile
                                              │  ses:SendEmail
                                              ▼
                                      admin@thecviu.com
```

## Files
| file | purpose |
|------|---------|
| `index.mjs` | Lambda handler (Node 20, ESM; uses the SDK bundled in the runtime) |
| `iam-policy.json` | least-privilege `ses:SendEmail` policy, scoped to the FROM address |
| `deploy.sh` | one-shot: creates the role, Lambda, and public Function URL |
| `package.json` | metadata only — no `npm install` needed |

---

## Step 1 — Verify your email/domain in SES (once)

SES will only send **from** an address or domain you have verified, and while
your account is in the SES **sandbox** it can only send **to** verified
addresses too.

```bash
# verify the sender/recipient address
aws ses verify-email-identity --email-address admin@thecviu.com --region us-east-1
# → click the confirmation link AWS emails to that address
```

For production, verify the whole **domain** (adds DKIM, lets any
`@coronaryatlas.com` address send) and **request production access** to leave
the sandbox so the form can email you from any submitter:

```bash
aws sesv2 create-email-identity --email-identity coronaryatlas.com --region us-east-1
# then: SES console → Account dashboard → "Request production access"
```

> Pick one region (e.g. `us-east-1`) and use it for SES **and** the Lambda.

## Step 2 — Deploy the Lambda

Requires AWS CLI v2 configured for your account (`aws configure`).

```bash
cd contact-backend
AWS_REGION=us-east-1 ./deploy.sh
```

It prints the **Function URL** at the end, e.g.
`https://abcd1234.lambda-url.us-east-1.on.aws/`.

To use your **real** Turnstile secret and lock CORS to your domain:

```bash
AWS_REGION=us-east-1 \
TURNSTILE_SECRET=0x_your_real_secret \
ALLOW_ORIGIN=https://coronaryatlas.com \
./deploy.sh
```

## Step 3 — Point the site at it

Set the endpoint in the site's build environment (e.g. a `.env.production` in
`pathway-atlas/`, or your host's env-var settings), then rebuild + redeploy the
static site:

```
NEXT_PUBLIC_CONTACT_ENDPOINT=https://abcd1234.lambda-url.us-east-1.on.aws/
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x_your_real_site_key
```

The form already prefers this endpoint when it is set and falls back to a
`mailto:` only when it is not — so nothing breaks before you deploy.

## Test it

```bash
curl -i -X POST "$FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -d '{"type":"General feedback","message":"hello from curl","cf-turnstile-response":"XXXX.DUMMY.TOKEN"}'
```

With the default (TEST) Turnstile secret any token string passes verification,
so a `200 {"ok":true,...}` confirms the SES path end-to-end. Swap in the real
secret before going live.

## Cost & security notes
- Well within the AWS free tier for form-level traffic (Lambda + SES pennies).
- The Function URL is public but useless without a valid Turnstile token.
- IAM role can **only** call `ses:SendEmail` from `admin@thecviu.com`.
- No AWS keys in the repo, the site, or the browser.

## Alternative (no AWS at all)
If you'd rather not run a Lambda, a hosted form service (Formspree, Web3Forms,
Basin) gives you a POST URL that emails you directly. Set that URL as
`NEXT_PUBLIC_CONTACT_ENDPOINT` and skip this whole folder. SES + Lambda is the
right choice when you specifically want mail sent through **your own** AWS
account, which is what "connect my SES" asks for.
