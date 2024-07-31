import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const createUser = internalMutation({
  // this is a mutation that only can be called from other parts of the application but not from the client
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      image: args.image,
      isOnline: true,
    });
  },
});

export const updateUser = internalMutation({
  args: { tokenIdentifier: v.string(), image: v.string() },
  async handler(ctx, args) {
    // different way of writing the handler
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      image: args.image,
    });
  },
});

export const setUserOnline = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique(); //the patch is for update. to update the user

    if (!user) {
      throw new ConvexError("User not found");
    }
    //the patch is for update. to update the user
    await ctx.db.patch(user._id, { isOnline: true });
  },
});

export const setUserOffline = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      ) // this is convex's syntax
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, { isOnline: false });
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const users = await ctx.db.query("users").collect();
    return users.filter(
      (user) => user.tokenIdentifier !== identity.tokenIdentifier
    );
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const getGroupMembers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId)) // filter the conversations field to to see the one conversation who's ID matches with the conversation id
      .first(); // if it matches then we take the first value
    if (!conversation) {
      // else we throw the conversation not found error
      throw new ConvexError("Conversation not found");
    }

    const users = await ctx.db.query("users").collect(); // finding the users of this conversation
    const groupMembers = users.filter((user) =>
      conversation.participants.includes(user._id)
    ); //filter the group users

    return groupMembers;
  },
});
