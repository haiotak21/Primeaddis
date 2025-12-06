#!/usr/bin/env node
// CLI script to send a test email using the app's sendMail wrapper.
// Usage: node scripts/send-test-email.js --to you@example.com --subject "Test" --html "<p>Hello</p>"

require("dotenv").config({ path: ".env.local" });

const { argv } = require("process");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const args = parseArgs(argv.slice(2));
    const to = args.to || process.env.TEST_EMAIL_TO || process.env.RESEND_FROM;
    const subject =
      args.subject ||
      `Test email from ${process.env.SITE_NAME || "PrimeAddis"}`;
    let html = args.html;

    if (!html && args.file) {
      const p = path.resolve(args.file);
      if (fs.existsSync(p)) html = fs.readFileSync(p, "utf8");
    }

    if (!to) {
      console.error(
        "No recipient specified. Use --to or set TEST_EMAIL_TO / RESEND_FROM in .env.local"
      );
      process.exit(1);
    }

    if (!html) html = `<p>Test email sent at ${new Date().toISOString()}</p>`;

    // Send directly via Resend API to avoid importing TypeScript mailer
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "RESEND_API_KEY not set in .env.local. Please set RESEND_API_KEY and try again."
      );
      process.exit(1);
    }

    const payload = {
      from: process.env.RESEND_FROM || "primeaddiset@support.com",
      to,
      subject,
      html,
    };

    console.log(`Sending test email to ${to} via Resend...`);
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.error("Send failed:", resp.status, resp.statusText, text);
        process.exit(2);
      }

      try {
        const json = JSON.parse(text);
        console.log("Send successful. Provider response:");
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log("Send successful. Provider raw response:");
        console.log(text);
      }
    } catch (err) {
      console.error("Send failed:", err);
      process.exit(2);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(3);
  }
}

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

main();
