/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
      "\\.(css|scss)$": "<rootDir>/src/tests/__mocks__/styleMock.js"
  },
};
