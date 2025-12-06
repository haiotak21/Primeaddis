#!/usr/bin/env node
// Send the welcome email HTML used by the app to a specified address via Resend.
// Usage:
//   node scripts/send-welcome-email.js --email you@example.com --name "Test User"

require("dotenv").config({ path: ".env.local" });
const fetch = global.fetch || require("node-fetch");

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const to = args.email;
  const name = args.name || "there";

  if (!to) {
    console.error(
      'Usage: node scripts/send-welcome-email.js --email you@example.com --name "Test User"'
    );
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set in .env.local");
    process.exit(1);
  }

  const siteName = process.env.SITE_NAME || "PrimeAddis";
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const from =
    process.env.SMTP_FROM || process.env.RESEND_FROM || "no-reply@example.com";

  const html = `<p>Hi ${name || "there"},</p>
<p>Welcome to ${siteName}! We're glad you joined.</p>
<p>You can browse listings here: <a href="${base}/properties">Browse properties</a></p>
<p>If you need help, reply to this email.</p>`;

  const payload = { from, to, subject: `Welcome to ${siteName}`, html };

  console.log(`Sending welcome email to ${to} from ${from} via Resend...`);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Send failed:", res.status, res.statusText, text);
      process.exit(2);
    }

    try {
      const json = JSON.parse(text);
      console.log("Send successful. Provider response:");
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Send successful. Raw response:");
      console.log(text);
    }
  } catch (err) {
    console.error("Send failed:", err);
    process.exit(2);
  }
}

main();
