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
  // Clear all collections between tests so tests are independent
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
