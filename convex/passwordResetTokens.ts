import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new password reset token
export const createToken = mutation({
  args: {
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Clean up expired tokens for this email before creating new one
    await ctx.db.query("passwordResetTokens")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.lt(q.field("expiresAt"), Date.now()))
      .collect()
      .then((expiredTokens) => {
        return Promise.all(expiredTokens.map((token) => ctx.db.delete(token._id)));
      });

    return await ctx.db.insert("passwordResetTokens", {
      email: args.email,
      token: args.token,
      expiresAt: args.expiresAt,
      used: false,
      createdAt: Date.now(),
    });
  },
});

// Validate and get token info
export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenDoc = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenDoc) {
      return null;
    }

    // Check if token is expired
    if (tokenDoc.expiresAt < Date.now()) {
      return { expired: true, email: tokenDoc.email };
    }

    // Check if token was already used
    if (tokenDoc.used) {
      return { used: true, email: tokenDoc.email };
    }

    return {
      valid: true,
      email: tokenDoc.email,
      _id: tokenDoc._id,
    };
  },
});

// Mark token as used
export const markTokenAsUsed = mutation({
  args: {
    tokenId: v.id("passwordResetTokens"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, {
      used: true,
      usedAt: Date.now(),
    });
  },
});

// Clean up expired tokens (can be called periodically)
export const cleanupExpiredTokens = mutation({
  handler: async (ctx) => {
    const expiredTokens = await ctx.db
      .query("passwordResetTokens")
      .filter((q) => q.lt(q.field("expiresAt"), Date.now()))
      .collect();

    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
    }

    return { cleaned: expiredTokens.length };
  },
});
