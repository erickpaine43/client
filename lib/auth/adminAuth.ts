import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import { api } from "../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexHelper = createAnalyticsConvexHelper(convex, "AdminAuthService");

export interface AdminAuthResult {
  isAuthorized: boolean;
  userId?: string;
  role?: "staff" | "admin" | "super_admin";
  permissions?: string[];
  error?: string;
}

interface NileUserData {
  id: string;
  isPenguinmailsStaff?: boolean;
  [key: string]: unknown;
}

interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  language?: string;
  screenResolution?: string;
  timezone?: string;
  cookieEnabled?: boolean;
  [key: string]: unknown;
}

/**
 * Verify admin access for API routes
 * Checks if user has admin privileges in NileDB
 */
export async function verifyAdminAccess(userId: string): Promise<AdminAuthResult> {
  try {
    // Check if user exists and has admin status in NileDB
    // This would typically call your NileDB API or direct database query
    const userData = await fetch(`${process.env.NILEDB_API_URL}/users/${userId}`)
      .then(res => res.json() as Promise<NileUserData>)
      .catch(() => null);

    if (!userData) {
      return { isAuthorized: false, error: "User not found" };
    }

    // Check if user has admin privileges
    if (!userData.isPenguinmailsStaff) {
      return { isAuthorized: false, error: "Not an admin user" };
    }

    // For now, return basic admin access
    // In production, you'd want more sophisticated role/permission checking
    // TODO: Implement proper role/permission checking from NileDB user_profiles
    return {
      isAuthorized: true,
      userId,
      role: "staff", // Default to staff, could be enhanced
      permissions: ["read"], // Basic permissions, could be enhanced
    };

  } catch (error) {
    console.error("Admin auth verification failed:", error);
    return {
      isAuthorized: false,
      error: "Authentication service unavailable"
    };
  }
}

/**
 * Middleware function for protecting admin API routes
 */
export async function requireAdminAccess(
  request: NextRequest,
  options: { requiredRole?: "staff" | "admin" | "super_admin" } = {}
): Promise<NextResponse | null> {
  try {
    // Get user ID from session/auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    // Verify token and extract user ID
    const userId = await verifyTokenAndGetUserId(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Verify admin access
    const adminAuth = await verifyAdminAccess(userId);

    if (!adminAuth.isAuthorized) {
      return NextResponse.json(
        { error: adminAuth.error || "Admin access required" },
        { status: 403 }
      );
    }

    // Check role requirements
    if (options.requiredRole) {
      const roleHierarchy = { staff: 1, admin: 2, super_admin: 3 };
      const userRoleLevel = roleHierarchy[adminAuth.role!] || 0;
      const requiredLevel = roleHierarchy[options.requiredRole];

      if (userRoleLevel < requiredLevel) {
        return NextResponse.json(
          { error: `Insufficient permissions. Required: ${options.requiredRole}` },
          { status: 403 }
        );
      }
    }

    // Log admin access
    try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      await convexHelper.mutation(api.adminAudit.logAdminAction, {
        adminUserId: userId,
        action: "system_config", // Generic access action
        resourceType: "user",
        resourceId: userId,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get("user-agent") || "Unknown",
        notes: `Admin API access: ${request.method} ${request.url}`,
      });
    } catch (logError) {
      console.warn("Failed to log admin access:", logError);
      // Don't fail the request if logging fails
    }

    return null; // Access granted, continue to route handler

  } catch (error) {
    console.error("Admin middleware error:", error);
    return NextResponse.json(
      { error: "Authentication service error" },
      { status: 500 }
    );
  }
}

/**
 * Extract client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  return "unknown";
}

/**
 * Verify JWT token and extract user ID
 * This is a placeholder - implement based on your auth system
 */
async function verifyTokenAndGetUserId(token: string): Promise<string | null> {
  try {
    // Placeholder implementation
    // In production, verify JWT token and extract user ID
    // This could integrate with NextAuth, Auth0, or custom JWT verification

    // For now, assume token is user ID (not secure!)
    return token;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Create admin session (called when admin logs in)
 */
export async function createAdminSession(
  userId: string,
  ipAddress: string,
  userAgent: string,
  deviceInfo?: DeviceInfo
) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const sessionId = await convexHelper.mutation(api.adminAudit.createAdminSession, {
      adminUserId: userId,
      sessionToken: generateSecureToken(),
      ipAddress,
      userAgent,
      deviceInfo,
    });

    return { sessionId, success: true };
  } catch (error) {
    console.error("Failed to create admin session:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update admin session activity
 */
export async function updateAdminSessionActivity(
  sessionId: string,
  ipAddress: string,
  userAgent: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await convexHelper.mutation(api.adminAudit.updateAdminSessionActivity, {
      sessionId,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to update admin session:", error);
  }
}

/**
 * End admin session (called when admin logs out)
 */
export async function endAdminSession(
  sessionId: string,
  userId: string,
  ipAddress: string,
  userAgent: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await convexHelper.mutation(api.adminAudit.endAdminSession, {
      sessionId,
      adminUserId: userId,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to end admin session:", error);
  }
}

/**
 * Generate a secure session token
 */
function generateSecureToken(): string {
  return crypto.randomUUID();
}
