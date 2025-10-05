/**
 * Basic Authentication Service Tests
 * 
 * Tests for authentication service functionality that don't require
 * a full NileDB client connection.
 */

import {
  AuthenticationError,
  SessionExpiredError,
  InvalidCredentialsError,
  AuthService
} from '../auth';

import type { NileSession } from '../auth';
import type { Server } from '@niledatabase/server';

interface TestExpressRequest {
  headers?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
}

type MockNileAuth = {
  getSession?: jest.Mock<Promise<NileSession | null>, [TestExpressRequest | undefined]>;
  signOut?: jest.Mock<Promise<void>, []>;
};

interface MockServer {
  auth: MockNileAuth;
  db?: {
    query: jest.Mock<unknown, [string, unknown[] | undefined]>;
  };
}

describe('Authentication Error Classes', () => {
  describe('AuthenticationError', () => {
    it('should create error with default code', () => {
      const error = new AuthenticationError('Test message');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('AUTH_REQUIRED');
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with custom code', () => {
      const error = new AuthenticationError('Test message', 'CUSTOM_CODE');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('SessionExpiredError', () => {
    it('should create session expired error with default message', () => {
      const error = new SessionExpiredError();
      expect(error.message).toBe('Session has expired');
      expect(error.code).toBe('SESSION_EXPIRED');
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should create session expired error with custom message', () => {
      const error = new SessionExpiredError('Custom session message');
      expect(error.message).toBe('Custom session message');
      expect(error.code).toBe('SESSION_EXPIRED');
    });
  });

  describe('InvalidCredentialsError', () => {
    it('should create invalid credentials error with default message', () => {
      const error = new InvalidCredentialsError();
      expect(error.message).toBe('Invalid credentials provided');
      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should create invalid credentials error with custom message', () => {
      const error = new InvalidCredentialsError('Custom credentials message');
      expect(error.message).toBe('Custom credentials message');
      expect(error.code).toBe('INVALID_CREDENTIALS');
    });
  });
});

describe('AuthService Class', () => {
  describe('Constructor', () => {
    it('should create AuthService instance', () => {
      // Mock NileDB client
      const mockNile: MockServer = {
        auth: {
          getSession: jest.fn(),
          signOut: jest.fn(),
        },
        db: {
          query: jest.fn(),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should create AuthService without client parameter', () => {
      // Mock getNileClient
      jest.doMock('../client', () => ({
        getNileClient: jest.fn().mockReturnValue({
          auth: { getSession: jest.fn() },
          db: { query: jest.fn() },
        }),
      }));

      const authService = new AuthService();
      expect(authService).toBeInstanceOf(AuthService);
    });
  });

  describe('getSession', () => {
    it('should return session from NileDB auth', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      const mockNile: MockServer = {
        auth: {
          getSession: jest.fn().mockResolvedValue(mockSession),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      const session = await authService.getSession();

      expect(mockNile.auth.getSession).toHaveBeenCalled();
      expect(session).toEqual(mockSession);
    });

    it('should return null on error', async () => {
      const mockNile: MockServer = {
        auth: {
          getSession: jest.fn().mockRejectedValue(new Error('Session error')),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      const session = await authService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from session', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockNile: MockServer = {
        auth: {
          getSession: jest.fn().mockResolvedValue({ user: mockUser }),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null when no session', async () => {
      const mockNile: MockServer = {
        auth: {
          getSession: jest.fn().mockResolvedValue(null),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when session has no user', async () => {
      const mockNile: MockServer = {
        auth: {
          getSession: jest.fn().mockResolvedValue({}),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should call NileDB auth signOut', async () => {
      const mockNile: MockServer = {
        auth: {
          signOut: jest.fn().mockResolvedValue(undefined),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);
      await authService.signOut();

      expect(mockNile.auth.signOut).toHaveBeenCalled();
    });

    it('should throw AuthenticationError on signOut failure', async () => {
      const mockNile: MockServer = {
        auth: {
          signOut: jest.fn().mockRejectedValue(new Error('SignOut failed')),
        },
      };

      const authService = new AuthService(mockNile as unknown as Server);

      await expect(authService.signOut()).rejects.toThrow(AuthenticationError);
      await expect(authService.signOut()).rejects.toThrow('Failed to sign out');
    });
  });
});

describe('Singleton Functions', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return same instance on multiple calls', async () => {
    // Mock the client module
    jest.doMock('../client', () => ({
      getNileClient: jest.fn().mockReturnValue({
        auth: { getSession: jest.fn() },
        db: { query: jest.fn() },
      }),
    }));

    const { getAuthService } = await import('../auth');

    const service1 = getAuthService();
    const service2 = getAuthService();

    expect(service1).toBe(service2);
    expect(service1).toBeInstanceOf(AuthService);
  });

  it('should create new instance after reset', async () => {
    // Mock the client module
    jest.doMock('../client', () => ({
      getNileClient: jest.fn().mockReturnValue({
        auth: { getSession: jest.fn() },
        db: { query: jest.fn() },
      }),
    }));

    const { getAuthService, resetAuthService } = await import('../auth');

    const service1 = getAuthService();
    resetAuthService();
    const service2 = getAuthService();

    expect(service1).not.toBe(service2);
    expect(service2).toBeInstanceOf(AuthService);
  });
});
