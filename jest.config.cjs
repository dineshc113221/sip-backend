module.exports = {
  testMatch: [
    '**/tests/**/*.+(ts|tsx)',
    '**/?(*.)+(spec|test).+(ts|tsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  preset: 'ts-jest',
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg|pdf)$": "<rootDir>/__mocks__/fileMock.js"
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  rootDir: ".",
  setupFiles: ['<rootDir>/src/jest/setEnvVars.js'],
  collectCoverage: true,
  coverageDirectory: "coverage",
};
