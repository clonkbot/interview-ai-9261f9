import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByInterview = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    interviewId: v.id("interviews"),
    role: v.union(v.literal("interviewer"), v.literal("candidate")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      interviewId: args.interviewId,
      userId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

export const markAudioPlayed = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.id);
    if (!message || message.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { audioPlayed: true });
  },
});
