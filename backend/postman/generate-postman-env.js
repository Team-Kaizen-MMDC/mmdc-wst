#!/usr/bin/env node
/**
 * Generate Postman environment from backend/.env
 * Reads PORT and FRONTEND_URL from .env and creates Japan_SSW_API.postman_environment.json
 *
 * Usage: node generate-postman-env.js
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const envFilePath = path.resolve(
  __dirname,
  "Japan_SSW_API.postman_environment.json",
);

const port = process.env.PORT || "3000";
const baseUrl = `http://localhost:${port}/api/v1`;

const postmanEnv = {
  id: "japan-ssw-api-local",
  name: "Japan SSW API - Local",
  values: [
    { key: "BASE_URL", value: baseUrl, enabled: true, type: "default" },
    { key: "PORT", value: port, enabled: true, type: "default" },
    {
      key: "FRONTEND_URL",
      value: process.env.FRONTEND_URL || "http://localhost:3000",
      enabled: true,
      type: "default",
    },
    { key: "JWT_TOKEN", value: "", enabled: true, type: "secret" },
    { key: "REGISTER_EMAIL", value: "", enabled: true, type: "default" },
    { key: "REGISTER_PASS", value: "", enabled: true, type: "default" },
    { key: "USER_ID", value: "", enabled: true, type: "default" },
    { key: "PROFILE_ID", value: "", enabled: true, type: "default" },
    { key: "JOB_ID", value: "", enabled: true, type: "default" },
    { key: "COMPANY_ID", value: "", enabled: true, type: "default" },
  ],
  _postman_variable_scope: "environment",
  _postman_exported_at: new Date().toISOString(),
  _postman_exported_using: "generate-postman-env.js",
};

fs.writeFileSync(envFilePath, JSON.stringify(postmanEnv, null, 2), "utf8");
console.log("✅ Postman environment generated successfully!");
console.log(`📁 File: ${envFilePath}`);
console.log(`🌐 BASE_URL: ${baseUrl}`);
console.log("\nNext steps:");
console.log("1. Import this environment file in Postman");
console.log('2. Select "Japan SSW API - Local" from the environment dropdown');
console.log("3. Run the test collection");
