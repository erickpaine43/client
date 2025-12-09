// @ts-nocheck
require('@testing-library/jest-dom')

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for tests
global.fetch = jest.fn();

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.NILEDB_USER = 'test-user';
process.env.NILEDB_PASSWORD = 'test-password';
process.env.NILEDB_API_URL = 'https://test.api.thenile.dev/v2/databases/test-db-id';
process.env.NILEDB_POSTGRES_URL = 'postgres://test.db.thenile.dev:5432/test_db';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// ---------------------------------------------------------------------------
//  MOCK next-intl to avoid ESM parsing errors in Jest
// ---------------------------------------------------------------------------
jest.mock("next-intl", () => ({
  useTranslations: () => ((key) => key), // returns the key as fallback
  useFormatter: () => ({ format: (value) => value }),
  NextIntlClientProvider: ({ children }) => children,
}));

