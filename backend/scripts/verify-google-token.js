#!/usr/bin/env node
/**
 * verify-google-token.js
 * Simple helper to verify a Google ID token using backend GOOGLE_CLIENT_ID.
 * Usage:
 *   node backend/scripts/verify-google-token.js <ID_TOKEN>
 */

const { OAuth2Client } = require("google-auth-library");
const path = require("path");

try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
} catch (e) {
  // ignore
}

const clientId = process.env.GOOGLE_CLIENT_ID;
if (!clientId) {
  console.error("GOOGLE_CLIENT_ID not set in backend/.env");
  process.exit(2);
}

const client = new OAuth2Client(clientId);

async function verify(idToken) {
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    console.log("Token is valid. Payload:");
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Token verification failed:", err.message || err);
    process.exit(1);
  }
}

const token = process.argv[2] || process.env.GOOGLE_TOKEN;
if (!token) {
  console.error(
    "Usage: node backend/scripts/verify-google-token.js <ID_TOKEN>",
  );
  process.exit(2);
}

verify(token);
