// Small config module to centralize environment variables and collection names
const dotenv = require("dotenv");
// Use path to be absolutely sure it finds the .env file in the backend folder
dotenv.config({ path: require('path').resolve(__dirname, '.env') });

const env = process.env;

// Check if it's actually loading
if (!env.MONGODB_URI) {
  console.log("❌ DEBUG: .env loaded but MONGODB_URI is still empty.");
} else {
  console.log("✅ DEBUG: MONGODB_URI found in .env");
}

const config = {
  MONGODB_URI: env.MONGODB_URI,
  DB_NAME: env.MONGODB_DB || "mmdc-wst",
  PORT: parseInt(env.PORT, 10) || 3000,
  // Per-collection env vars. Prefer explicit names; fall back to legacy MONGODB_COLLECTION.
  COLLECTIONS: {
    ABOUT:
      env.ABOUT_COLLECTION ||
      env.CONTENT_COLLECTION ||
      env.MONGODB_COLLECTION ||
      "about",
    CONTENT: env.CONTENT_COLLECTION || env.MONGODB_COLLECTION || "content",
    JOBS: env.JOBS_COLLECTION || "jobs",
    USERS: env.USERS_COLLECTION || "users",
  },
};

module.exports = config;
