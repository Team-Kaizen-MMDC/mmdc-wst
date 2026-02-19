const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../src/models/User");
const UserProfile = require("../src/models/UserProfile");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mmdc-wst";

async function connect() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to", MONGODB_URI);
}

function localeToNationality(locale) {
  if (!locale) return "";
  // locale often like en-US or ja-JP
  const parts = String(locale).split("-");
  return parts.length > 1 ? parts.pop() : "";
}

async function syncAllUsers() {
  await connect();

  const users = await User.find({}).lean();
  let created = 0;
  let updated = 0;

  for (const u of users) {
    const gp = u.googleProfile || {};
    const names = (gp.name || "").trim().split(/\s+/).filter(Boolean);
    const inferredFirst = gp.given_name || names[0] || "Unknown";
    const inferredLast =
      gp.family_name ||
      (names.length > 1 ? names.slice(1).join(" ") : "Unknown");
    const dob = gp.dateOfBirth
      ? new Date(gp.dateOfBirth)
      : new Date("1970-01-01");
    const nationality = localeToNationality(gp.locale) || "Unknown";

    try {
      let profile = await UserProfile.findOne({ user: u._id });
      if (!profile) {
        const doc = {
          user: u._id,
          firstName: inferredFirst || "Unknown",
          lastName: inferredLast || "Unknown",
          dateOfBirth: dob,
          nationality: nationality || "Unknown",
          availability: { visaStatus: "not-applicable" },
          photoPath: gp.picture || undefined,
        };

        await UserProfile.create(doc);
        created++;
        console.log("Created UserProfile for", u.email);
      } else {
        let changed = false;
        if (gp.given_name && profile.firstName !== gp.given_name) {
          profile.firstName = gp.given_name;
          changed = true;
        }
        if (gp.family_name && profile.lastName !== gp.family_name) {
          profile.lastName = gp.family_name;
          changed = true;
        }
        if (gp.picture && profile.photoPath !== gp.picture) {
          profile.photoPath = gp.picture;
          changed = true;
        }
        if (gp.dateOfBirth) {
          const existingDob = profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString()
            : null;
          if (existingDob !== new Date(gp.dateOfBirth).toISOString()) {
            profile.dateOfBirth = new Date(gp.dateOfBirth);
            changed = true;
          }
        }
        if (gp.locale) {
          const nat = localeToNationality(gp.locale) || "Unknown";
          if (profile.nationality !== nat) {
            profile.nationality = nat;
            changed = true;
          }
        }

        if (changed) {
          await profile.save();
          updated++;
          console.log("Updated UserProfile for", u.email);
        }
      }
    } catch (err) {
      console.warn("Failed processing", u.email, err.message || err);
    }
  }

  console.log("Sync complete. Created:", created, "Updated:", updated);
  await mongoose.disconnect();
}

syncAllUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
