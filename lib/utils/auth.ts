import { nile } from "../../app/api/[...nile]/nile";
import { cookies } from "next/headers";

// User type from NileDB
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Session type
export interface Session {
  user: AuthUser;
  expiresAt: Date;
  isValid: boolean;
}

// Auth error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// Auth error codes
export const AUTH_ERROR_CODES = {
  NO_SESSION: "NO_SESSION",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
} as const;

/**
 * Get the current authenticated user from NileDB
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const user = await nile.users.getSelf();
    
    // Check if we got a Response object (error case)
    if (user instanceof Response) {
      if (user.status === 401) {
        return null;
      }
      throw new AuthError(
        "Failed to get user",
        AUTH_ERROR_CODES.UNAUTHORIZED,
        user.status
      );
    }
    
    // Validate user object
    if (!user || typeof user !== "object") {
      return null;
    }
    
    // Ensure required fields exist
    if (!("id" in user) || !("email" in user)) {
      return null;
    }
    
    return user as AuthUser;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new AuthError(
      "Authentication required",
      AUTH_ERROR_CODES.NO_SESSION,
      401
    );
  }
  
  return user;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Require user ID - throws if not authenticated
 */
export async function requireUserId(): Promise<string> {
  const user = await requireAuth();
  return user.id;
}

/**
 * Check if the current request has a valid session
 */
export async function hasValidSession(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Get session information
 */
export async function getSession(): Promise<Session | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }
    
    // In a real implementation, you would check session expiry
    // from a session store or JWT token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Default 24 hour session
    
    return {
      user,
      expiresAt,
      isValid: true,
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

/**
 * Validate that the user has specific permissions
 * This is a placeholder - implement based on your permission system
 */
export async function hasPermission(
  permission: string,
  userId?: string
): Promise<boolean> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      return false;
    }
    
    // TODO: Implement actual permission checking
    // For now, all authenticated users have all permissions
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user owns a resource
 */
export async function ownsResource(
  resourceUserId: string,
  userId?: string
): Promise<boolean> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      return false;
    }
    
    return currentUserId === resourceUserId;
  } catch {
    return false;
  }
}

/**
 * Middleware helper for server actions
 */
export async function withAuth<T, Args extends unknown[]>(
  handler: (userId: string, ...args: Args) => Promise<T>,
  ...args: Args
): Promise<T> {
  const userId = await requireUserId();
  return handler(userId, ...args);
}

/**
 * Middleware helper with optional auth
 */
export async function withOptionalAuth<T, Args extends unknown[]>(
  handler: (userId: string | null, ...args: Args) => Promise<T>,
  ...args: Args
): Promise<T> {
  const userId = await getCurrentUserId();
  return handler(userId, ...args);
}

/**
 * Rate limiting helper (basic implementation)
 * In production, use a proper rate limiting solution
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<boolean> {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of Array.from(rateLimitMap.entries())) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Get user's IP address for rate limiting
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

/**
 * Session validation helper
 */
export async function validateSession(sessionToken?: string): Promise<boolean> {
  if (!sessionToken) {
    // Try to get from cookies if not provided
    const cookieStore = await cookies();
    sessionToken = cookieStore.get("session")?.value;
  }
  
  if (!sessionToken) {
    return false;
  }
  
  // In a real implementation, validate the session token
  // against a session store or verify JWT
  // For now, just check if we can get the current user
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Logout helper
 */
export async function logout(): Promise<void> {
  try {
    // Clear any client-side session
    const cookieStore = await cookies();
    cookieStore.delete("session");
    
    // You might also want to call a NileDB logout endpoint
    // await nile.auth.logout();
  } catch (error) {
    console.error("Logout error:", error);
    throw new AuthError(
      "Failed to logout",
      AUTH_ERROR_CODES.UNAUTHORIZED,
      500
    );
  }
}
