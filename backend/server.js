require("dotenv").config();
const config = require("./src/config/database"); // Pointing to your database config
const { createApp } = require("./src/app");

// Fallback to 5000 if PORT isn't in config
const PORT = process.env.PORT || 5000; 

async function start() {
  try {
    // This waits for the DB connection (client) and Express app to be ready
    const { app, client } = await createApp();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
      console.log(`📄 Main page available at /pages/about.html`);
    });

    // Graceful shutdown: Ensures no data corruption when stopping the server
    process.on("SIGINT", async () => {
      console.log("\nSIGINT received: closing server and DB connection...");
      server.close(async () => {
        try {
          if (client) await client.close(); 
          console.log("✔️ MongoDB connection closed");
          process.exit(0);
        } catch (err) {
          console.error("Error closing MongoDB client", err);
          process.exit(1);
        }
      });
    });
  } catch (err) {
    console.error("💥 Fatal error starting server:", err);
    process.exit(1);
  }
}

start();