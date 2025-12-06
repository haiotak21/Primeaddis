Resend Email Setup

This project uses Resend.com for transactional emails. The repository includes a lightweight wrapper at `lib/mailer.ts` that calls Resend's HTTP API.

Environment variables

- `RESEND_API_KEY` (required): Your Resend API key (starts with `re_...`).
- `RESEND_FROM` (optional): Default sender address used by the Resend client if `SMTP_FROM` is not set.
- `SMTP_FROM` (optional, preferred): Global sender address used across the app for all emails (welcome emails, property alerts, etc.). When set, `lib/mailer.ts` will use this value as the From address.

Important: do NOT commit API keys or `.env.local` to source control. Add these values to your deployment provider (Vercel, Render, etc.) or to a local `.env.local` for development.

Quick CLI test (local)

1. Add values to `.env.local` in the project root:

```dotenv
RESEND_API_KEY=re_...your_api_key_here...
RESEND_FROM=onboarding@resend.dev
SMTP_FROM=onboarding@resend.dev
```

2. Run the provided test script to send a test email:

```powershell
node .\scripts\send-test-email.js --to you@example.com --subject "Resend test" --html "<p>Hello</p>"
```

This posts directly to Resend's API and prints the provider response.

Admin debug endpoint

There's an admin-only endpoint you can use from the running app to test sending as the server (requires signing in as an admin):

POST `/api/debug/send-test-email` with JSON body:

```json
{ "to": "you@example.com", "subject": "Test", "html": "<p>Hi</p>" }
```

The endpoint returns the Resend provider response or an error.

Domain verification

If you want to send from your own domain (recommended for deliverability), add and verify the domain in Resend and follow their DKIM/SPF/MX instructions. After DNS propagation, update `SMTP_FROM`/`RESEND_FROM` to an address at your verified domain.

Troubleshooting

- 403 with message about domain verification: the sending domain is not verified in Resend. Verify the domain or use a verified `RESEND_FROM`.
- Ensure `RESEND_API_KEY` is set and correct.
- Check server logs for thrown errors from `lib/mailer.ts` — the wrapper throws provider errors so they surface in logs.

If you'd like, I can prepare provider-specific DNS instructions (Cloudflare, Route53, GoDaddy, etc.) if you paste the DNS records Resend gave you or tell me your DNS host.
