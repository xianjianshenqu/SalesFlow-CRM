// Jest setup file
import '@jest/globals';

// Extend timeout for async operations
jest.setTimeout(30000);

// Mock console methods if needed
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };