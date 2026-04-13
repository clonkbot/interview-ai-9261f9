import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("interviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const get = query({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const interview = await ctx.db.get(args.id);
    if (!interview || interview.userId !== userId) return null;
    return interview;
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const active = await ctx.db
      .query("interviews")
      .withIndex("by_status", (q) => q.eq("userId", userId).eq("status", "active"))
      .first();
    return active;
  },
});

export const create = mutation({
  args: { title: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("interviews", {
      userId,
      title: args.title,
      role: args.role,
      status: "active",
      startedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const interview = await ctx.db.get(args.id);
    if (!interview || interview.userId !== userId) throw new Error("Not found");

    const updates: { status: "active" | "completed" | "paused"; endedAt?: number } = {
      status: args.status
    };
    if (args.status === "completed") {
      updates.endedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const addSummary = mutation({
  args: { id: v.id("interviews"), summary: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const interview = await ctx.db.get(args.id);
    if (!interview || interview.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { summary: args.summary });
  },
});
