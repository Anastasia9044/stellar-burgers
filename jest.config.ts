import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  collectCoverage: true,
  moduleNameMapper: {
    '^@api$': '<rootDir>/src/utils/burger-api.ts'
  },

  coverageDirectory: 'coverage',

  coverageProvider: 'v8',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}]
  }
};

export default config;
