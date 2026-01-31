require("dotenv").config();
const { MongoClient } = require("mongodb");

async function listCollections() {
  const uri = process.env.MONGODB_URI;

  // Validate environment variables
  if (!uri) {
    console.error("❌ Error: MONGODB_URI is not defined in .env file");
    console.error(
      "📝 Make sure you're running this script from the backend directory:",
    );
    console.error("   cd backend");
    console.error("   node scripts/list-collections.js");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully!\n");

    const db = client.db(process.env.MONGODB_DB || "japansswdb");

    console.log("📊 Collections in database:");
    console.log("=".repeat(50));

    const collections = await db.listCollections().toArray();

    // Collections that are actively used in the codebase
    const activeCollections = [
      "users",
      "profiles",
      "userprofiles", // Mongoose pluralizes model names
      "companies",
      "jobs",
      "applications",
      "contents",
      "about",
    ];

    if (collections.length === 0) {
      console.log("⚠️  No collections found in database");
      console.log(
        "\n💡 Tip: This might be a new database. Run the seed script to populate it:",
      );
      console.log("   npm run seed");
    } else {
      collections.forEach((col) => {
        const isActive = activeCollections.includes(col.name);
        const status = isActive ? "✅ ACTIVE  " : "❌ UNUSED ";
        console.log(`${status} ${col.name}`);
      });
    }

    console.log("=".repeat(50));
    console.log(`\nTotal collections: ${collections.length}`);
    console.log(
      `Active collections: ${collections.filter((c) => activeCollections.includes(c.name)).length}`,
    );

    const unusedCount = collections.filter(
      (c) => !activeCollections.includes(c.name),
    ).length;
    console.log(`Potentially unused: ${unusedCount}`);

    if (unusedCount > 0) {
      console.log("\n💡 Tip: Review unused collections before removing them.");
      console.log(
        "   You can use scripts/check-collection-sizes.js to see their size.",
      );
    }

    console.log();

    await client.close();
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("━".repeat(50));

    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ETIMEDOUT")
    ) {
      console.error("🌐 Network Error: Cannot reach MongoDB server");
      console.error("\n📝 Possible solutions:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify MONGODB_URI in .env file");
      console.error("   3. Check MongoDB Atlas network access settings");
      console.error("   4. Ensure your IP is whitelisted in MongoDB Atlas");
    } else if (error.message.includes("authentication failed")) {
      console.error("🔐 Authentication Error: Invalid credentials");
      console.error("\n📝 Possible solutions:");
      console.error("   1. Check username and password in MONGODB_URI");
      console.error("   2. Verify database user permissions in MongoDB Atlas");
    } else if (error.message.includes("connection string")) {
      console.error("⚠️  Invalid Connection String");
      console.error("\n📝 Make sure MONGODB_URI is in the correct format:");
      console.error(
        "   mongodb+srv://username:password@cluster.mongodb.net/database",
      );
    } else {
      console.error(`⚠️  ${error.message}`);
      console.error("\n📝 For help, check:");
      console.error("   - MongoDB Atlas Dashboard");
      console.error("   - backend/.env configuration");
    }

    console.error("━".repeat(50));
    process.exit(1);
  }
}

listCollections();
