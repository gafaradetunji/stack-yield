/** @type {import('jest').Config} */
const config = {
  displayName: 'tests',
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        types: ['jest', 'node'],
        esModuleInterop: true,
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/__tests__/**/*.ts',
    '<rootDir>/**/*.spec.ts',
    '<rootDir>/**/*.test.ts',
    '<rootDir>/../tests/**/*.test.ts',
  ],
  // run Jest from this package folder so presets resolve correctly
  rootDir: './',
  modulePaths: ['<rootDir>/src', '<rootDir>/node_modules'],
  roots: ['<rootDir>', '<rootDir>/../tests'],
};

module.exports = config;



