// Small config module to centralize environment variables and collection names
require("dotenv").config();

const env = process.env;

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
