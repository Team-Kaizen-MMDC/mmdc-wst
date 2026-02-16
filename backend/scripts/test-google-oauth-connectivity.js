#!/usr/bin/env node
/**
 * test-google-oauth-connectivity.js
 * Quick script to verify outbound connectivity to Google's OAuth/OpenID endpoints.
 * - Fetches OpenID Connect discovery document
 * - Fetches jwks_uri from the discovery document
 *
 * Usage: node backend/scripts/test-google-oauth-connectivity.js
 */

const https = require('https');
const { URL } = require('url');

function fetchJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'mmdc-wst-test/1.0',
        Accept: 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({ statusCode: res.statusCode, body: parsed, headers: res.headers });
        } catch (err) {
          reject(new Error(`Failed to parse JSON from ${url}: ${err.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function main() {
  const discoveryUrl = 'https://accounts.google.com/.well-known/openid-configuration';
  console.log('Fetching OpenID Connect discovery document from', discoveryUrl);

  try {
    const discovery = await fetchJson(discoveryUrl);
    console.log('Discovery status:', discovery.statusCode);
    console.log('Issuer:', discovery.body.issuer || '<none>');
    console.log('authorization_endpoint:', discovery.body.authorization_endpoint || '<none>');
    console.log('token_endpoint:', discovery.body.token_endpoint || '<none>');
    console.log('jwks_uri:', discovery.body.jwks_uri || '<none>');

    if (!discovery.body.jwks_uri) {
      console.error('No jwks_uri found in discovery document — cannot validate JWKS');
      process.exitCode = 2;
      return;
    }

    console.log('\nFetching JWKS from', discovery.body.jwks_uri);
    const jwks = await fetchJson(discovery.body.jwks_uri);
    console.log('JWKS status:', jwks.statusCode);
    if (jwks.body.keys && Array.isArray(jwks.body.keys)) {
      console.log('Number of keys in JWKS:', jwks.body.keys.length);
      // Print the kid values (truncated) to help manual verification
      const kids = jwks.body.keys.map((k) => k.kid || '<no-kid>');
      console.log('Key IDs:', kids.join(', '));
      process.exitCode = 0;
    } else {
      console.error('Unexpected JWKS format:', typeof jwks.body);
      process.exitCode = 3;
    }
  } catch (err) {
    console.error('Connectivity check failed:', err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
