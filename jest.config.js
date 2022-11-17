/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  verbose: true,
  moduleFileExtensions: ["ts", "tsx", "js"],
  modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/[.].*"],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
};
