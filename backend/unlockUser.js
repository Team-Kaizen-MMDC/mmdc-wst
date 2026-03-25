#!/usr/bin/env node
/**
 * unlockUser.js
 *
 * Resets login lockout for a user account in MongoDB Atlas.
 *
 * Usage:
 *   cd backend
 *   node unlockUser.js test@test.com
 *   node unlockUser.js                   # defaults to test@test.com
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./src/models/User");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}` +
    `@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}` +
    `?retryWrites=true&w=majority`;

const email = process.argv[2] || "test@test.com";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { loginAttempts: 0, lockUntil: null, isActive: true } },
    { new: true }
  );

  if (!user) {
    console.error(`❌  User not found: ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`✅  Unlocked: ${user.email}`);
    console.log(`   loginAttempts : ${user.loginAttempts}`);
    console.log(`   lockUntil     : ${user.lockUntil}`);
    console.log(`   isActive      : ${user.isActive}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exitCode = 1;
  mongoose.disconnect();
});
