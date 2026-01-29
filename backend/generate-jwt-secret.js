#!/usr/bin/env node

/**
 * Generate a secure JWT secret key
 * Usage: node generate-jwt-secret.js
 */

const crypto = require("crypto");

const secret = crypto.randomBytes(32).toString("hex");

console.log("\n✅ Generated secure JWT_SECRET:\n");
console.log(secret);
console.log("\n📝 Add this to your .env file:");
console.log(`JWT_SECRET=${secret}\n`);
