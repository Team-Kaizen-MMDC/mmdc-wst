#!/usr/bin/env node
/**
 * seedTestUser.js
 *
 * Upserts a fully-populated profile for test@test.com in MongoDB Atlas.
 * Existing user credentials are preserved; only the UserProfile is replaced.
 *
 * Usage:
 *   cd backend
 *   node seedTestUser.js
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./src/models/User");
const UserProfile = require("./src/models/UserProfile");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}` +
    `@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}` +
    `?retryWrites=true&w=majority`;

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "Test123!"; // only used if user does not exist yet

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas");

  // ── 1. Ensure the user exists ───────────────────────────────────────────
  let user = await User.findOne({ email: TEST_EMAIL });
  if (!user) {
    user = await User.create({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "jobseeker",
    });
    console.log(`Created new user: ${TEST_EMAIL}`);
  } else {
    console.log(`Found existing user: ${TEST_EMAIL} (id: ${user._id})`);
  }

  // ── 2. Remove any existing profile so we get a clean upsert ────────────
  await UserProfile.deleteOne({ user: user._id });

  // ── 3. Create a fully-populated test profile ────────────────────────────
  const profile = await UserProfile.create({
    user: user._id,

    // Basic info
    firstName: "Juan",
    lastName: "De La Cruz",
    dateOfBirth: new Date("1998-06-15"),
    gender: "male",
    nationality: "Filipino",

    // Contact
    phone: "+63 912 345 6789",
    address: "123 Rizal Street",
    city: "Manila",
    prefecture: "Metro Manila",
    postalCode: "1000",

    // Professional
    japaneseLevel: "N3",
    bio: "Experienced food-service professional seeking SSW opportunities in Japan. JLPT N3 certified with 3 years of restaurant management experience.",

    // Education
    education: [
      {
        school: "Polytechnic University of the Philippines",
        degree: "Bachelor of Science",
        field: "Hotel and Restaurant Management",
        startDate: new Date("2016-06-01"),
        endDate: new Date("2020-03-15"),
        current: false,
        description: "Graduated with academic distinction. Active member of the HRM Society.",
      },
    ],

    // Experience
    experience: [
      {
        company: "Jollibee Foods Corporation",
        title: "Assistant Store Manager",
        startDate: new Date("2020-07-01"),
        endDate: new Date("2023-12-31"),
        current: false,
        description:
          "Supervised daily operations for a high-volume quick-service restaurant. Trained 15+ crew members and achieved consistent 4.8/5 customer satisfaction scores.",
      },
      {
        company: "SM Food Group",
        title: "Food Service Crew Lead",
        startDate: new Date("2024-01-15"),
        current: true,
        description:
          "Leading a team of 8 in food preparation and service. Responsible for inventory management and quality control.",
      },
    ],

    // Skills
    skills: [
      { name: "Food Preparation", level: "expert",       category: "Food Service" },
      { name: "Team Leadership",  level: "advanced",     category: "Management"   },
      { name: "Inventory Control", level: "advanced",    category: "Operations"   },
      { name: "Customer Service", level: "expert",       category: "Service"      },
      { name: "Japanese (JLPT N3)", level: "intermediate", category: "Language"   },
      { name: "POS Systems",       level: "intermediate", category: "Technology"  },
    ],

    // Certifications
    certifications: [
      {
        name: "JLPT N3",
        issuer: "Japan Foundation",
        date: new Date("2023-01-10"),
      },
      {
        name: "Food Safety Certification",
        issuer: "Philippine FDA",
        date: new Date("2021-05-20"),
      },
      {
        name: "SSW Food Service Proficiency Test",
        issuer: "Japan Food Service Association",
        date: new Date("2024-08-15"),
      },
    ],

    // Languages
    languages: [
      { language: "Filipino", level: "native" },
      { language: "English",  level: "fluent" },
      { language: "Japanese", level: "conversational" },
    ],

    // Availability
    availability: {
      startDate:       new Date("2026-04-01"),
      visaStatus:      "not-applicable",
      visaValidUntil:  new Date("2027-03-31"),
      desiredIndustry: "Food and Beverages",
      relocate:        true,
      remote:          false,
    },

    profileCompleted: true,
  });

  console.log("\n✅ Profile seeded successfully!");
  console.log(`   User ID:    ${user._id}`);
  console.log(`   Profile ID: ${profile._id}`);
  console.log(`   Name:       ${profile.firstName} ${profile.lastName}`);
  console.log(`   Email:      ${TEST_EMAIL}`);
  console.log(`   Password:   ${user.isModified ? "(unchanged)" : TEST_PASSWORD} (if newly created)`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exitCode = 1;
  mongoose.disconnect();
});
