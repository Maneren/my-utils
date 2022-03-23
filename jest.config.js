/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  verbose: true,
  testEnvironment: 'jest-environment-node',
  transform: {
    '.tsx?': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/[.].*']
};
