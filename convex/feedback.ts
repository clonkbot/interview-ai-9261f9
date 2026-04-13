import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByInterview = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("feedback")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
      .first();
  },
});

export const create = mutation({
  args: {
    interviewId: v.id("interviews"),
    analysis: v.string(),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("feedback", {
      interviewId: args.interviewId,
      userId,
      analysis: args.analysis,
      score: args.score,
      createdAt: Date.now(),
    });
  },
});
