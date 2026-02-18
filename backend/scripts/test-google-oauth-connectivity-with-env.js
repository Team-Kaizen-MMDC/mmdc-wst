#!/usr/bin/env node
/**
 * test-google-oauth-connectivity-with-env.js
 * Loads `backend/.env` (if present), prints configured GOOGLE_CLIENT_ID (and masked secret),
 * then fetches Google's OpenID Connect discovery document and JWKS to verify connectivity.
 *
 * Usage: node backend/scripts/test-google-oauth-connectivity-with-env.js
 */

const https = require("https");
const { URL } = require("url");
const path = require("path");

// Load backend/.env if present
try {
  const dotenvPath = path.resolve(__dirname, "..", ".env");
  require("dotenv").config({ path: dotenvPath });
} catch (e) {
  // ignore
}

function fetchJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      timeout: timeoutMs,
      headers: {
        "User-Agent": "mmdc-wst-test/1.0",
        Accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({
            statusCode: res.statusCode,
            body: parsed,
            headers: res.headers,
          });
        } catch (err) {
          reject(new Error(`Failed to parse JSON from ${url}: ${err.message}`));
        }
      });
    });

    req.on("timeout", () => {
      req.destroy(
        new Error(`Request to ${url} timed out after ${timeoutMs}ms`),
      );
    });
    req.on("error", (err) => reject(err));
    req.end();
  });
}

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "<not-set>";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "<not-set>";
  const redirectUris = process.env.GOOGLE_REDIRECT_URIS || "<not-set>";

  function maskSecret(s) {
    if (!s || s === "<not-set>") return s;
    if (s.length <= 8) return "*****";
    return s.slice(0, 4) + "..." + s.slice(-4);
  }

  console.log("Configured GOOGLE_CLIENT_ID:", clientId);
  console.log("Configured GOOGLE_CLIENT_SECRET:", maskSecret(clientSecret));
  console.log("Configured GOOGLE_REDIRECT_URIS:", redirectUris);

  const discoveryUrl =
    "https://accounts.google.com/.well-known/openid-configuration";
  console.log(
    "\nFetching OpenID Connect discovery document from",
    discoveryUrl,
  );

  try {
    const discovery = await fetchJson(discoveryUrl);
    console.log("Discovery status:", discovery.statusCode);
    console.log("Issuer:", discovery.body.issuer || "<none>");
    console.log(
      "authorization_endpoint:",
      discovery.body.authorization_endpoint || "<none>",
    );
    console.log("token_endpoint:", discovery.body.token_endpoint || "<none>");
    console.log("jwks_uri:", discovery.body.jwks_uri || "<none>");

    if (!discovery.body.jwks_uri) {
      console.error(
        "No jwks_uri found in discovery document — cannot validate JWKS",
      );
      process.exitCode = 2;
      return;
    }

    console.log("\nFetching JWKS from", discovery.body.jwks_uri);
    const jwks = await fetchJson(discovery.body.jwks_uri);
    console.log("JWKS status:", jwks.statusCode);
    if (jwks.body.keys && Array.isArray(jwks.body.keys)) {
      console.log("Number of keys in JWKS:", jwks.body.keys.length);
      const kids = jwks.body.keys.map((k) => k.kid || "<no-kid>");
      console.log("Key IDs:", kids.join(", "));
      process.exitCode = 0;
    } else {
      console.error("Unexpected JWKS format:", typeof jwks.body);
      process.exitCode = 3;
    }
  } catch (err) {
    console.error("Connectivity check failed:", err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
