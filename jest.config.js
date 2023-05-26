/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: false,
  collectCoverageFrom: [],
  coverageReporters: ["text", "html"],
  coverageThreshold: {global: {lines: 90, branches: 80}}
};
