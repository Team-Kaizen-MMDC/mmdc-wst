#!/usr/bin/env node
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_HOST;
    if (!mongoUri) {
      console.error("No MONGODB_URI configured in backend/.env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    console.log("Connected to MongoDB");

    const User = require("../src/models/User");
    const UserProfile = require("../src/models/UserProfile");

    // Create a unique test user email to avoid collisions
    const ts = Date.now();
    const email = `simulate-google-${ts}@example.com`;
    const googleId = `sim-google-${ts}`;

    const googleProfile = {
      id: googleId,
      email,
      name: "Simulated Test User",
      given_name: "Simulated",
      family_name: "User",
      picture: "https://example.com/avatar.png",
      locale: "en-US",
    };

    console.log(`Creating User ${email}`);
    const user = await User.create({
      email,
      role: "jobseeker",
      authProvider: "google",
      googleId,
      googleProfile,
      isEmailVerified: true,
      lastLogin: new Date(),
    });

    console.log("User created:", user._id.toString());

    // Simulate the passport.js post-create UserProfile logic
    let existingProfile = await UserProfile.findOne({ user: user._id });
    if (existingProfile) {
      console.log(
        "UserProfile already exists — unexpected for this test:",
        existingProfile._id.toString(),
      );
    } else {
      console.log("No existing UserProfile found — creating one now");

      // mapping logic similar to passport.js
      let firstName = googleProfile.given_name || "";
      let lastName = googleProfile.family_name || "";
      if (!firstName && googleProfile.name) {
        const parts = String(googleProfile.name).trim().split(/\s+/);
        if (parts.length === 1) firstName = parts[0];
        else if (parts.length > 1) {
          firstName = parts.slice(0, -1).join(" ");
          lastName = lastName || parts.slice(-1).join(" ");
        }
      }
      if (!firstName) firstName = "User";
      if (!lastName) lastName = "";

      const profileData = {
        user: user._id,
        firstName,
        lastName,
        dateOfBirth: new Date("1970-01-01"),
        nationality: googleProfile.locale
          ? String(googleProfile.locale).split("-").pop()
          : "not-applicable",
        photoPath: googleProfile.picture,
        availability: { visaStatus: "not-applicable" },
      };

      const profile = await UserProfile.create(profileData);
      console.log("Created UserProfile:", profile._id.toString());

      // Show the created document
      const full = await UserProfile.findById(profile._id).populate(
        "user",
        "email role googleProfile",
      );
      console.log(
        "UserProfile document:",
        JSON.stringify(full.toObject(), null, 2),
      );

      // Cleanup: remove test documents
      console.log("Cleaning up test documents...");
      await UserProfile.deleteOne({ _id: profile._id });
      await User.deleteOne({ _id: user._id });
      console.log("Cleanup complete");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB — done");
  } catch (err) {
    console.error("Error in simulate-passport:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
