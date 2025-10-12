import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create admin session
export const createAdminSession = mutation({
  args: {
    adminUserId: v.string(),
    sessionToken: v.string(),
    ipAddress: v.string(),
    userAgent: v.string(),
    deviceInfo: v.optional(v.object({
      browser: v.string(),
      os: v.string(),
      device: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("admin_sessions", {
      adminUserId: args.adminUserId,
      sessionToken: args.sessionToken,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      startedAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      isActive: true,
      deviceInfo: args.deviceInfo,
    });

    // Log session creation
    await ctx.db.insert("admin_audit_log", {
      adminUserId: args.adminUserId,
      action: "session_start",
      resourceType: "admin_session",
      resourceId: sessionId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      notes: "Admin session started",
    });

    return sessionId;
  },
});

// Update admin session activity
export const updateAdminSessionActivity = mutation({
  args: {
    sessionId: v.id("admin_sessions"),
    ipAddress: v.string(),
    userAgent: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      lastActivity: Date.now(),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });
  },
});

// End admin session
export const endAdminSession = mutation({
  args: {
    sessionId: v.id("admin_sessions"),
    adminUserId: v.string(),
    ipAddress: v.string(),
    userAgent: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      isActive: false,
      lastActivity: Date.now(),
    });

    // Log session end
    await ctx.db.insert("admin_audit_log", {
      adminUserId: args.adminUserId,
      action: "session_end",
      resourceType: "admin_session",
      resourceId: args.sessionId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      notes: "Admin session ended",
    });
  },
});

// Comprehensive admin action logging
export const logAdminAction = mutation({
  args: {
    adminUserId: v.string(),
    action: v.union(
      v.literal("user_status_change"),
      v.literal("company_status_change"),
      v.literal("billing_update"),
      v.literal("system_config"),
      v.literal("role_assignment"),
      v.literal("permission_grant"),
      v.literal("session_start"),
      v.literal("session_end")
    ),
    resourceType: v.union(
      v.literal("user"),
      v.literal("company"),
      v.literal("tenant"),
      v.literal("subscription"),
      v.literal("payment"),
      v.literal("role"),
      v.literal("permission"),
      v.literal("admin_session")
    ),
    resourceId: v.string(),
    tenantId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    ipAddress: v.string(),
    userAgent: v.string(),
    notes: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const logEntry = {
      adminUserId: args.adminUserId,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      tenantId: args.tenantId,
      oldValues: args.oldValues,
      newValues: args.newValues,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
      notes: args.notes,
      metadata: args.metadata,
    };

    await ctx.db.insert("admin_audit_log", logEntry);

    // Check for security-related actions that need system events
    if (args.action === "user_status_change" && args.newValues?.status === "banned") {
      await ctx.db.insert("admin_system_events", {
        eventType: "security_alert",
        severity: "warning",
        message: `User ${args.resourceId} banned by admin ${args.adminUserId}`,
        adminUserId: args.adminUserId,
        tenantId: args.tenantId,
        timestamp: Date.now(),
        details: {
          action: "user_banned",
          targetUserId: args.resourceId,
          reason: args.notes,
        },
      });
    }
  },
});

// Get active admin sessions
export const getActiveAdminSessions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("admin_sessions")
      .withIndex("isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(50);
  },
});

// Get recent admin activity
export const getRecentAdminActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admin_audit_log")
      .withIndex("timestamp")
      .order("desc")
      .take(args.limit || 100);
  },
});

// Get admin activity for specific user
export const getAdminUserActivity = query({
  args: { adminUserId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admin_audit_log")
      .withIndex("adminUserId", (q) => q.eq("adminUserId", args.adminUserId))
      .order("desc")
      .take(args.limit || 50);
  },
});

// Get admin activity for specific resource
export const getResourceAdminActivity = query({
  args: {
    resourceType: v.string(),
    resourceId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admin_audit_log")
      .filter((q) =>
        q.and(
          q.eq(q.field("resourceType"), args.resourceType),
          q.eq(q.field("resourceId"), args.resourceId)
        )
      )
      .order("desc")
      .take(args.limit || 20);
  },
});

// Get admin activity by tenant
export const getTenantAdminActivity = query({
  args: { tenantId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admin_audit_log")
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .order("desc")
      .take(args.limit || 50);
  },
});
