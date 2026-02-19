const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../src/models/User");
const UserProfile = require("../src/models/UserProfile");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mmdc-wst";

async function connect() {
  await mongoose.connect(MONGODB_URI);
}

function splitName(name = "") {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function syncByEmail(email) {
  await connect();
  const user = await User.findOne({ email }).lean();
  if (!user) {
    console.error("User not found for email:", email);
    await mongoose.disconnect();
    return;
  }

  const profile = await UserProfile.findOne({ user: user._id });
  if (!profile) {
    console.log("No UserProfile exists for user. Creating minimal profile.");
    const gp = user.googleProfile || {};
    const nm = splitName(gp.name || gp.given_name || "");
    const doc = {
      user: user._id,
      firstName: nm.firstName || "",
      lastName: nm.lastName || "",
      dateOfBirth: gp.dateOfBirth
        ? new Date(gp.dateOfBirth)
        : new Date("1970-01-01"),
      nationality: gp.locale ? String(gp.locale).split("-").pop() : "",
      photoPath: gp.picture || undefined,
      availability: { visaStatus: "not-applicable" },
    };
    try {
      const created = await UserProfile.create(doc);
      console.log("Created UserProfile:", created._id.toString());
    } catch (err) {
      console.error("Failed to create UserProfile:", err.message || err);
    }
    await mongoose.disconnect();
    return;
  }

  console.log("Before sync:", {
    firstName: profile.firstName,
    lastName: profile.lastName,
    photoPath: profile.photoPath,
    dateOfBirth: profile.dateOfBirth,
    nationality: profile.nationality,
  });

  const gp = user.googleProfile || {};
  const nm = splitName(gp.name || gp.given_name || "");
  let changed = false;

  if (nm.firstName && profile.firstName !== nm.firstName) {
    profile.firstName = nm.firstName;
    changed = true;
  }
  if (nm.lastName && profile.lastName !== nm.lastName) {
    profile.lastName = nm.lastName;
    changed = true;
  }
  if (gp.picture && profile.photoPath !== gp.picture) {
    profile.photoPath = gp.picture;
    changed = true;
  }
  if (
    gp.dateOfBirth &&
    (!profile.dateOfBirth ||
      new Date(profile.dateOfBirth).toISOString() !==
        new Date(gp.dateOfBirth).toISOString())
  ) {
    profile.dateOfBirth = new Date(gp.dateOfBirth);
    changed = true;
  }
  if (gp.locale) {
    const nat = String(gp.locale).split("-").pop();
    if (nat && profile.nationality !== nat) {
      profile.nationality = nat;
      changed = true;
    }
  }

  if (changed) {
    await profile.save();
    console.log("Profile updated.");
  } else {
    console.log("No changes needed.");
  }

  console.log("After sync:", {
    firstName: profile.firstName,
    lastName: profile.lastName,
    photoPath: profile.photoPath,
    dateOfBirth: profile.dateOfBirth,
    nationality: profile.nationality,
  });

  await mongoose.disconnect();
}

// Run with email argument
const email = process.argv[2];
if (!email) {
  console.error("Usage: node sync-userprofile-from-user.js <email>");
  process.exit(1);
}

syncByEmail(email).catch((err) => {
  console.error(err);
  process.exit(1);
});
