import { Laugh, Mic, Plus, Send } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { AppPortalAccessIn } from "svix";
import { useConversationStore } from "@/store/chat-store";
import useComponentVisible from "@/hooks/useComponentVisible";
import   EmojiPicker, { Theme } from 'emoji-picker-react';
import { EmojiProperties } from "emoji-picker-react/dist/dataUtils/DataTypes";
import MediaDropdown from "./media-dropdown";
const MessageInput = () => {
	const [msgText, setMsgText] = useState("");
	const sendMessage = useMutation(api.messages.sendTextMessages);
	const me = useQuery(api.users.getMe);
	const {selectedConversation} = useConversationStore();
	const sendMessageHanler = async (e: React.FormEvent) =>{
		e.preventDefault();
		try {
			await sendMessage({content:msgText, coversation:selectedConversation!._id, sender:me!._id});
			setMsgText("")
		} catch (error) {
			console.log(error);
			
		}
	}
	const {ref, isComponentVisible, setIsComponentVisible} = useComponentVisible(false);
	return (
		<div className='bg-gray-primary p-2 flex gap-4 items-center'>
			<div className='relative flex gap-2 ml-2'>
				{/* EMOJI PICKER WILL GO HERE */}
				<div ref={ref} onClick={()=>setIsComponentVisible(true)}>
				
				{
					isComponentVisible && 
					(
						<EmojiPicker theme={Theme.DARK} 
						
						
						onEmojiClick={(emojiObject) => {
							setMsgText((prev) => prev + emojiObject.emoji);
							console.log(emojiObject.emoji);
							
						}}
						style={{position:"absolute", bottom:"1.5em", left:"1em", zIndex:999}}
						/>
					)
				}
				<Laugh className='text-gray-600 dark:text-gray-400' />
				</div>
				<MediaDropdown />
			</div>
			
			<form onSubmit={sendMessageHanler} className='w-full flex gap-3'>
				<div className='flex-1'>
					<Input
						type='text'
						placeholder='Type a message'
						className='py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent'
						value={msgText}
						onChange={(e) => setMsgText(e.target.value)}
					/>
				</div>
				<div className='mr-4 flex items-center gap-3'>
					{msgText.length > 0 ? (
						<Button
							type='submit'
							size={"sm"}
							className='bg-transparent text-foreground hover:bg-transparent'
						>
							<Send />
						</Button>
					) : (
						<Button
							type='submit'
							size={"sm"}
							className='bg-transparent text-foreground hover:bg-transparent'
						>
							<Mic />
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};
export default MessageInput;