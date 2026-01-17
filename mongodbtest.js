const { MongoClient, ServerApiVersion } = require("mongodb");
// Load local environment variables from .env when present (development only)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv is optional; if it's not installed, we still proceed to read process.env
}

// Prefer a full MongoDB connection string in MONGODB_URI. As an alternative,
// individual components can be provided via MONGODB_USER, MONGODB_PASS and MONGODB_HOST.
let uri = process.env.MONGODB_URI;
if (!uri) {
  const user = process.env.MONGODB_USER;
  const pass = process.env.MONGODB_PASS;
  const host = process.env.MONGODB_HOST; // e.g. japansswcluster0.lvia1ct.mongodb.net
  if (user && pass && host) {
    uri = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/?appName=mmdc-wst`;
  }
}

if (!uri) {
  console.error(
    "Missing MongoDB connection configuration. Set MONGODB_URI or MONGODB_USER,MONGODB_PASS,MONGODB_HOST in environment."
  );
  process.exit(1);
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
