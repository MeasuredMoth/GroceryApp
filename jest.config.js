/** @type {import("ts-jest").JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "__tests__",
  ],
  modulePaths: [
    "<rootDir>",
  ],
  moduleDirectories: [
    "node_modules"
  ]
};
