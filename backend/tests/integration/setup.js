/**
 * Jest global test setup for backend integration tests.
 *
 * Spins up an in-memory MongoDB via mongodb-memory-server, points
 * MONGODB_URI at it, and ensures Mongoose is disconnected and the server
 * is torn down after every suite.
 */

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.USE_MONGOOSE = "true";
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret-32-chars-minimum!!";
  process.env.JWT_EXPIRE = "1h";
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  // Safety guard: only clear collections when connected to a local memory server.
  // If the connection host is not localhost/127.0.0.1, skip — this prevents
  // accidental deleteMany() calls against the real Atlas cluster when mongoose
  // auto-reconnects after a memory-server teardown.
  const host = mongoose.connection?.host || "";
  if (!host.match(/localhost|127\.0\.0\.1/i)) return;

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
