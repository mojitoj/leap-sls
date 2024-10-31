module.exports = {
  globalSetup: "<rootDir>/testsSetup.js",
  globalTeardown: "<rootDir>/testsTeardown.js",
  modulePathIgnorePatterns: ["./test/fixtures", "./test/config"],
  collectCoverage: true
};
