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

async function run() {
  await connect();
  console.log("Connected to", MONGODB_URI);

  // Create a test user
  const email = `test.user.${Date.now()}@example.com`;
  const user = await User.create({
    email,
    password: "Test123!",
    role: "jobseeker",
  });
  console.log("Created user", user._id.toString());

  // Create a profile that's incomplete (missing education/experience/skills)
  const profile = await UserProfile.create({
    user: user._id,
    firstName: "Test",
    lastName: "User",
    dateOfBirth: new Date("1990-01-01"),
    nationality: "Japan",
    phone: "", // phone required for profileCompleted per schema logic
    education: [
      {
        school: "Test University",
        degree: "Bachelors",
        startDate: new Date("2010-04-01"),
      },
    ],
    skills: [
      {
        name: "Testing",
        level: "intermediate",
      },
    ],
  });

  console.log(
    "Initial profileCreated profileCompleted:",
    profile.profileCompleted,
  );

  // Perform a query-based update like the API does (this bypasses save middleware)
  const updated = await UserProfile.findOneAndUpdate(
    { user: user._id },
    { $set: { phone: "+81-3-0000-0000" } },
    { new: true, runValidators: true },
  );

  console.log(
    "After findOneAndUpdate returned profileCompleted:",
    updated.profileCompleted,
  );

  // Wait briefly to allow post hooks to run and save
  await new Promise((r) => setTimeout(r, 500));

  const reloaded = await UserProfile.findOne({ user: user._id }).lean();
  console.log("Reloaded profile.profileCompleted:", reloaded.profileCompleted);

  // Clean up
  await User.deleteOne({ _id: user._id });
  await UserProfile.deleteOne({ _id: profile._id });

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
