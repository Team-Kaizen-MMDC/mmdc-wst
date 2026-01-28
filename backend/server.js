require("dotenv").config();
const config = require("./config");
const { createApp } = require("./src/app");

const PORT = config.PORT;

async function start() {
  try {
    const { app, client } = await createApp();

    const server = app.listen(PORT, () => {
      console.log(
        `Server listening on http://localhost:${PORT} — open /pages/about.html`,
      );
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("SIGINT received: closing server and DB connection...");
      server.close(async () => {
        try {
          // Only close client if using native driver (not Mongoose)
          if (client) {
            await client.close();
            console.log("MongoDB client connection closed");
          } else if (app.locals.mongoose) {
            await app.locals.mongoose.connection.close();
            console.log("Mongoose connection closed");
          }
          process.exit(0);
        } catch (err) {
          console.error("Error closing MongoDB connection", err);
          process.exit(1);
        }
      });
    });
  } catch (err) {
    console.error("Fatal error starting server", err);
    process.exit(1);
  }
}

start();
