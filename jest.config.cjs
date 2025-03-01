module.exports = {
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js'],
  moduleDirectories: ['node_modules'],
  transformIgnorePatterns: [],
  setupFilesAfterEnv: [],
  verbose: true
};