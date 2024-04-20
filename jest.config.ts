/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@model/(.*)$': '<rootDir>/src/model/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],
  maxWorkers: 8,
};
