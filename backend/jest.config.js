module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/src/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/integration/setup.js"],
  testTimeout: 30000,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/config/swagger.js",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/helpers/"],
};
