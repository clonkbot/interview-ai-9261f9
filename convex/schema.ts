import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Interview sessions
  interviews: defineTable({
    userId: v.id("users"),
    title: v.string(),
    role: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    summary: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_status", ["userId", "status"]),

  // Interview messages (transcription)
  messages: defineTable({
    interviewId: v.id("interviews"),
    userId: v.id("users"),
    role: v.union(v.literal("interviewer"), v.literal("candidate")),
    content: v.string(),
    timestamp: v.number(),
    audioPlayed: v.optional(v.boolean()),
  }).index("by_interview", ["interviewId"]),

  // Interview feedback/analysis
  feedback: defineTable({
    interviewId: v.id("interviews"),
    userId: v.id("users"),
    analysis: v.string(),
    score: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_interview", ["interviewId"]),
});
