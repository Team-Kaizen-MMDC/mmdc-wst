#!/usr/bin/env node
// Helper script to generate a Google OAuth2 consent URL or exchange a code for tokens.
// Usage:
//   node scripts/exchange-code-for-token.js         # prints consent URL
//   node scripts/exchange-code-for-token.js <CODE>  # exchanges code and prints tokens

require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/v1/auth/google/callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment",
  );
  process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT);

async function main() {
  const code = process.argv[2];
  if (!code) {
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "consent",
    });

    console.log("Open this URL in your browser to authorize:");
    console.log(url);
    console.log("\nAfter consenting, copy the `code` query param and run:");
    console.log(`node scripts/exchange-code-for-token.js <CODE>`);
    return;
  }

  try {
    const r = await client.getToken(code);
    const tokens = r.tokens || r;
    console.log("Tokens:");
    console.log(JSON.stringify(tokens, null, 2));
    console.log(
      '\nYou can copy `id_token` and POST to /api/v1/auth/google as {"googleToken":"<id_token>"}',
    );
  } catch (err) {
    console.error("Failed to exchange code for tokens:", err.message || err);
    process.exit(1);
  }
}

main();
