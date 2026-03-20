module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/src/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/config/swagger.js",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/helpers/"],
};
