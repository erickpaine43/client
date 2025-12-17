// Mock for lib/utils/auth
export const getCurrentUserId = jest.fn(() => Promise.resolve('test-user-123'));
export const getCurrentUser = jest.fn(() => Promise.resolve({ id: 'test-user-123', email: 'test@example.com' }));
export const requireAuth = jest.fn(() => Promise.resolve({ id: 'test-user-123', email: 'test@example.com' }));
export const requireUserId = jest.fn(() => Promise.resolve('test-user-123'));
export const hasValidSession = jest.fn(() => Promise.resolve(true));
export const hasPermission = jest.fn(() => Promise.resolve(true));
export const ownsResource = jest.fn(() => Promise.resolve(true));

// Export all the other functions as jest mocks
export const getSession = jest.fn();
// Mock cookies module
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock classes
export class AuthError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

export const AUTH_ERROR_CODES = {
  NO_SESSION: "NO_SESSION",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
} as const;
