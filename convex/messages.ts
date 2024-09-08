import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { map } from "svix/dist/openapi/rxjsStub";

export const sendTextMessages = mutation({
    args:{
        sender: v.string(),
        content: v.string(),
        coversation: v.id("coversations")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("User not authenticated");
        }
        const user = await ctx.db.query("users")
        .withIndex("by_tokenIdentifier", q=>q.eq("tokenIdentifier",identity.tokenIdentifier)).unique();
        if(!user){
            throw new ConvexError("No user found");

        }
        const conversation = await ctx.db.query("coversations").filter((q)=>q.eq(q.field("_id"), args.coversation)).first();
        if(!conversation){
            throw new ConvexError("No conversation found");

        }
        if(!conversation.participants.includes(user._id))
        {
            throw new ConvexError("User not participated in this conversation");
        }
        await ctx.db.insert("messages",{
            sender: args.sender,
            content: args.content,
            coversation: args.coversation,
            messageType: "text"

        })
    },
});
export const getTextMessages = query({
    args:{
        conversation:v.id("coversations"),
    },
    handler: async (ctx, args) => {

        const identity = ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("User not authenticated!");
        }
        const messages = await ctx.db.query("messages")
        .withIndex("by_conversation",q=>q.eq("coversation",args.conversation))
        .collect();
        const userProfileCache = new Map();

        const messagesWithSender = await Promise.all(
            messages.map(async (message)=>{
                let sender;
                if(userProfileCache.has(message.sender)){
                    sender = userProfileCache.get(message.sender)
                }else{
                    sender = await ctx.db.query("users").filter((q)=>q.eq(q.field("_id"),message.sender))
                    .first();
                    userProfileCache.set(message.sender,sender)
                }
                return {...message,sender}
            })
        )
        return messagesWithSender;

    }

});
export const sendImage = mutation({
	args: { imgId: v.id("_storage"), sender: v.id("users"), coversation: v.id("coversations") },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError("Unauthorized");
		}

		const content = (await ctx.storage.getUrl(args.imgId)) as string;

		await ctx.db.insert("messages", {
			content: content,
			sender: args.sender,
			messageType: "image",
			coversation: args.coversation,
		});
	},
});

export const sendVideo = mutation({
	args: { videoId: v.id("_storage"), sender: v.id("users"), coversation: v.id("coversations") },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError("Unauthorized");
		}

		const content = (await ctx.storage.getUrl(args.videoId)) as string;

		await ctx.db.insert("messages", {
			content: content,
			sender: args.sender,
			messageType: "video",
			coversation: args.coversation,
		});
	},
});