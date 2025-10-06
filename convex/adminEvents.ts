import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Log system events
export const logSystemEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("system_startup"),
      v.literal("system_shutdown"),
      v.literal("config_change"),
      v.literal("security_alert"),
      v.literal("performance_issue")
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
    message: v.string(),
    details: v.optional(v.record(v.string(), v.any())),
    adminUserId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("admin_system_events", {
      eventType: args.eventType,
      severity: args.severity,
      message: args.message,
      details: args.details,
      adminUserId: args.adminUserId,
      tenantId: args.tenantId,
      timestamp: Date.now(),
    });

    return eventId;
  },
});

// Log security alert
export const logSecurityAlert = mutation({
  args: {
    message: v.string(),
    details: v.record(v.string(), v.any()),
    adminUserId: v.optional(v.string()),
    tenantId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("admin_system_events", {
      eventType: "security_alert",
      severity: "warning",
      message: args.message,
      details: args.details,
      adminUserId: args.adminUserId,
      tenantId: args.tenantId,
      timestamp: Date.now(),
    });
  },
});

// Log configuration change
export const logConfigChange = mutation({
  args: {
    message: v.string(),
    details: v.record(v.string(), v.any()),
    adminUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("admin_system_events", {
      eventType: "config_change",
      severity: "info",
      message: args.message,
      details: args.details,
      adminUserId: args.adminUserId,
      timestamp: Date.now(),
    });
  },
});

// Resolve system event
export const resolveSystemEvent = mutation({
  args: {
    eventId: v.id("admin_system_events"),
    resolution: v.string(),
    resolvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      resolvedAt: Date.now(),
      resolution: args.resolution,
    });

    // Log the resolution
    await ctx.db.insert("admin_system_events", {
      eventType: "config_change",
      severity: "info",
      message: `System event resolved: ${args.resolution}`,
      details: {
        resolvedEventId: args.eventId,
        resolvedBy: args.resolvedBy,
      },
      adminUserId: args.resolvedBy,
      timestamp: Date.now(),
    });
  },
});

// Get system events with filters
export const getSystemEvents = query({
  args: {
    eventType: v.optional(v.union(
      v.literal("system_startup"),
      v.literal("system_shutdown"),
      v.literal("config_change"),
      v.literal("security_alert"),
      v.literal("performance_issue")
    )),
    severity: v.optional(v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    )),
    resolved: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("admin_system_events");

    if (args.eventType) {
      query = query.filter((q) => q.eq(q.field("eventType"), args.eventType));
    }

    if (args.severity) {
      query = query.filter((q) => q.eq(q.field("severity"), args.severity));
    }

    if (args.resolved !== undefined) {
      if (args.resolved) {
        query = query.filter((q) => q.neq(q.field("resolvedAt"), undefined));
      } else {
        query = query.filter((q) => q.eq(q.field("resolvedAt"), undefined));
      }
    }

    return await query
      .order("desc")
      .take(args.limit || 50);
  },
});

// Get recent security alerts
export const getRecentSecurityAlerts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admin_system_events")
      .filter((q) => q.eq(q.field("eventType"), "security_alert"))
      .order("desc")
      .take(args.limit || 20);
  },
});

// Get unresolved critical events
export const getUnresolvedCriticalEvents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("admin_system_events")
      .filter((q) =>
        q.and(
          q.eq(q.field("severity"), "critical"),
          q.eq(q.field("resolvedAt"), undefined)
        )
      )
      .order("desc")
      .take(10);
  },
});

// Get system health summary
export const getSystemHealthSummary = query({
  handler: async (ctx) => {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);

    // Get events from last 24 hours
    const recentEvents = await ctx.db
      .query("admin_system_events")
      .filter((q) => q.gte(q.field("timestamp"), last24Hours))
      .collect();

    // Count by severity
    const summary = {
      total: recentEvents.length,
      critical: recentEvents.filter(e => e.severity === "critical").length,
      error: recentEvents.filter(e => e.severity === "error").length,
      warning: recentEvents.filter(e => e.severity === "warning").length,
      info: recentEvents.filter(e => e.severity === "info").length,
      unresolved: recentEvents.filter(e => !e.resolvedAt).length,
      lastEvent: recentEvents.length > 0 ? Math.max(...recentEvents.map(e => e.timestamp)) : null,
    };

    return summary;
  },
});

// Clean up old resolved events (older than 30 days)
export const cleanupOldEvents = mutation({
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    const oldEvents = await ctx.db
      .query("admin_system_events")
      .filter((q) =>
        q.and(
          q.neq(q.field("resolvedAt"), undefined),
          q.lt(q.field("resolvedAt"), thirtyDaysAgo)
        )
      )
      .collect();

    // Delete old events
    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
    }

    return { deleted: oldEvents.length };
  },
});
