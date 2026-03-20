#!/usr/bin/env node
/**
 * create-admin.js
 *
 * Creates (or resets) the superadmin User + UserProfile in MongoDB Atlas.
 * Safe to run multiple times — uses upsert so it won't duplicate records.
 *
 * Usage:
 *   node scripts/create-admin.js
 *   ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=MyPass@99 node scripts/create-admin.js
 *
 * Defaults (override via env vars):
 *   ADMIN_EMAIL    = admin@mmdc.local
 *   ADMIN_PASSWORD = SuperAdmin@1234
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");
const UserProfile = require("../src/models/UserProfile");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in backend/.env");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mmdc.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SuperAdmin@1234";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB:", MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@"));

  // ── 1. Upsert User ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    // Reset password and ensure admin role
    user.password = passwordHash;
    user.role = "admin";
    user.isActive = true;
    user.authProvider = "local";
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    // Mark password as modified so the pre-save hook re-hashes (we pre-hash above
    // to skip the hook, but we need to mark it modified to actually save)
    user.markModified("password");
    // Bypass the pre-save bcrypt hook since we already hashed above
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: passwordHash,
          role: "admin",
          isActive: true,
          authProvider: "local",
          loginAttempts: 0,
        },
        $unset: { lockUntil: "" },
      },
    );
    console.log(`🔄  Existing user updated: ${ADMIN_EMAIL}`);
  } else {
    // Create new — bypass pre-save hook by inserting the already-hashed password
    // directly so bcrypt doesn't double-hash it.
    user = await User.create({
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: "admin",
      authProvider: "local",
      isActive: true,
      isEmailVerified: true,
    });
    // Immediately overwrite with the pre-hashed password (pre-save hook will
    // have hashed it again; fix that by patching directly).
    await User.updateOne({ _id: user._id }, { $set: { password: passwordHash } });
    // Re-fetch to get the corrected doc
    user = await User.findById(user._id);
    console.log(`✨  New admin user created: ${ADMIN_EMAIL}`);
  }

  // ── 2. Upsert UserProfile ────────────────────────────────────────────────────
  const profileData = {
    user: user._id,
    firstName: "Super",
    lastName: "Admin",
    dateOfBirth: new Date("1990-01-01"),
    gender: "prefer-not-to-say",
    nationality: "Filipino",
    phone: "+63-900-000-0000",
    address: "MMDC Campus",
    city: "Manila",
    prefecture: "Metro Manila",
    postalCode: "1000",
    bio: "Superadmin account for testing CRUD functionalities.",
    japaneseLevel: "none",
    availability: {
      visaStatus: "not-applicable",
      relocate: false,
      remote: false,
    },
    profileCompleted: true,
  };

  const existingProfile = await UserProfile.findOne({ user: user._id });

  if (existingProfile) {
    await UserProfile.updateOne({ user: user._id }, { $set: profileData });
    console.log("🔄  Existing UserProfile updated.");
  } else {
    await UserProfile.create(profileData);
    console.log("✨  New UserProfile created.");
  }

  // Link profile back to user if not already linked
  const updatedProfile = await UserProfile.findOne({ user: user._id });
  if (!user.profile || String(user.profile) !== String(updatedProfile._id)) {
    await User.updateOne({ _id: user._id }, { $set: { profile: updatedProfile._id } });
    console.log("🔗  User.profile reference updated.");
  }

  console.log("\n─────────────────────────────────────────────");
  console.log("  SUPERADMIN CREDENTIALS");
  console.log("─────────────────────────────────────────────");
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log(`  Role     : admin`);
  console.log(`  User ID  : ${user._id}`);
  console.log("─────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("✅  Done.");
}

run().catch((err) => {
  console.error("❌  Script failed:", err.message || err);
  process.exit(1);
});
