import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { use } from "react";

export const createConversation = mutation({
    args:{
        participants:v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("_storage")),
        admin: v.optional(v.id("users")),
    },
    handler: async (ctx, args) =>{
        const identity = ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError(" User not authenticated");
        }
        const existingConversation = await ctx.db.query("coversations")
        .filter((q)=> q.or(
            q.eq(q.field("participants"),args.participants),
            q.eq(q.field("participants"),args.participants.reverse())
        )).first();
        let groupImage;
        if(existingConversation){
            return existingConversation._id;
        }

        if(args.groupImage){
            groupImage = (await ctx.storage.getUrl(args.groupImage) as string) ;
        }
        const conversationId = await ctx.db.insert("coversations",{
            participants:args.participants,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage,
            admin: args.admin,
        })
        return conversationId;
    }
});
export const getMyConversations = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new ConvexError("User not authenticated");
        const user = await ctx.db
			.query("users")
			.withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique();
        // if(!user)throw new ConvexError("No user found!");
        const coversations = await ctx.db.query("coversations").collect();
        const myConversations = coversations.filter((conversation)=>{
            return conversation.participants.includes(user?._id!);
        });
        const converstationsWithDetails = await Promise.all(
            myConversations.map(async (conversation) =>{
                let userDetails = {};
                if (!conversation.isGroup) {
                const otherUsers = conversation.participants.find((id)=> id!= user?._id);
                const userProfiles = await ctx.db.query("users")
                .filter((q)=>q.eq(q.field("_id"),otherUsers))
                .take(1);
                userDetails = userProfiles[0];
                }

                const lastMessages = await ctx.db.query("messages")
                .filter((q)=>q.eq(q.field("coversation"),conversation._id))
                .order("desc").take(1);
            
            return{
                ...userDetails,
                ...conversation,
                lastMessages:  lastMessages[0] || null


            }
        })
        )

        return converstationsWithDetails;
    }
});
export const kickUser = mutation({
    args:{
        coversationId : v.id("coversations"),
        userId :v.id("users")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError(" User not authenticated");
        }
        const coversation = await ctx.db.query("coversations")
        .filter((q)=>q.eq(q.field("_id"),args.coversationId)).unique();
        if(!coversation){
            throw new ConvexError("Conversation not found ");
        }
        await ctx.db.patch(args.coversationId,
            {
                participants: coversation.participants.filter((id)=>
                    id !== args.userId
                )
            }

        )

    }

})
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  });