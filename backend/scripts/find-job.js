require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("No MONGODB_URI or MONGO_URI found in environment.");
    process.exit(2);
  }

  const jobId = process.argv[2] || "697a1200ea83ffeeba366d4d";
  console.log("Searching for job id:", jobId);

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    // List databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      try {
        const db = client.db(dbName);
        const cols = await db.listCollections({}).toArray();
        const colNames = cols.map((c) => c.name);
        // naive check common collections
        const candidates = colNames.filter((n) =>
          /jobs?|companies?|users?/i.test(n),
        );
        if (candidates.length === 0) continue;

        for (const col of candidates) {
          const collection = db.collection(col);
          const doc = await collection.findOne({
            _id: (() => {
              try {
                return new ObjectId(jobId);
              } catch {
                return jobId;
              }
            })(),
          });
          if (doc) {
            console.log(`Found in ${dbName}.${col}`);
            console.log(doc);
            await client.close();
            process.exit(0);
          }
        }
      } catch (e) {
        // ignore db-specific errors
      }
    }

    console.log("Not found in any DB collections checked.");
    await client.close();
    process.exit(4);
  } catch (err) {
    console.error(
      "Error connecting/searching:",
      err && err.message ? err.message : err,
    );
    if (client) await client.close();
    process.exit(5);
  }
}

run();
