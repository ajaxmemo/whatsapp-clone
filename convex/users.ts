import { use } from "react";
import { internalMutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { error } from "console";
import { auth } from "@clerk/nextjs/server";

export const createUser = internalMutation({
    args: {
        name: v.optional(v.string()),
        image: v.string(),
        email: v.string(),
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        const taksId = ctx.db.insert("users", {
            name: args.name,
            image: args.image,
            email: args.email,
            tokenIdentifier: args.tokenIdentifier,
            isOnline: true,
        });
        return taksId
    }


});
export const updateUser = internalMutation({
    args: {
        image: v.string(),
        tokenIdentifier: v.string(),

    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier",args.tokenIdentifier) ).unique();
        if(!user){
            throw new ConvexError("User not found");
        }

        await ctx.db.patch(user._id,{image:args.image});


    },


});
export const setUserOnline = internalMutation({
    args: {
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier",args.tokenIdentifier) ).unique();
        if(!user){
            throw new ConvexError("User not found");
        }

        await ctx.db.patch(user._id,{isOnline:true});


    },


});
export const setUserOffline = internalMutation({
    args: {
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier",args.tokenIdentifier) ).unique();
        if(!user){
            throw new ConvexError("User not found");
        }

        await ctx.db.patch(user._id,{isOnline:false});


    },


});
export const getUsers = query({
    args:{},
    handler: async (ctx, args) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if(!userIdentity){
            throw new ConvexError("User not authenticated");
        }
        const users = await ctx.db.query("users").collect();
        return users.filter((user)=>user.tokenIdentifier!== userIdentity.tokenIdentifier);
        

    }

});
export const getMe = query({
    args:{},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("User not authenticated");
        }
        const user = await ctx.db.query("users")
        .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier",identity.tokenIdentifier) )
        .unique();
        if(!user){
            throw new ConvexError("User not found");
        }
        return user;

    }

});

export const getGroupMembers = query({
    args:{
        conversationId: v.id("coversations")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("User not authenticated");
        }
        const conversation = await ctx.db.query("coversations")
        .filter((q)=>q.eq(q.field("_id"), args.conversationId))
        .first();
        if(!conversation){
            throw new ConvexError("No conversations found");

        }
        const users = await ctx.db.query("users").collect();
        const getMembers = users.filter((user)=>conversation.participants.includes(user._id));
        return getMembers;
        

    }
})