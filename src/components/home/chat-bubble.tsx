import { MessageSeenSvg } from "@/lib/svgs";

import { IMessage, useConversationStore } from "@/store/chat-store";
import ChatBubbleAvatar from "./chat-bubble-avatar";
import DateIndicator from "./date-indicator";
import Image from "next/image";
import ReactPlayer from "react-player";
import ChatAvatarAction from "./chat-avatar-action";
type typeOfBubble = {
	message: IMessage;
	me: any;
	perviousMessage:IMessage

}

const ChatBubble = ({me,message,perviousMessage}:typeOfBubble) => {
	const {selectedConversation} = useConversationStore();
	const date = new Date(message._creationTime);
	const hour = date.getHours().toString().padStart(2, "0");
	const minute = date.getMinutes().toString().padStart(2, "0");
	const time = `${hour}:${minute}`;
	const isMember = selectedConversation?.participants.includes(message.sender._id) || false;
	const isGroup = selectedConversation?.isGroup || false;
	const fromMe = message.sender._id == me._id;
	const bgClass = fromMe ? "bg-green-chat" : "bg-white dark:bg-gray-primary" ;

	if(!fromMe){
		return (
		<>
		<DateIndicator message={message} previousMessage={perviousMessage}/>
			<div className="flex gap-1 w-2/3">
			<ChatBubbleAvatar 
					message={message}
					isGroup={isGroup}
					isMember={isMember}
					/>
				<div className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}>
					
					<OtherMessageIndicator/>
					{isGroup && <ChatAvatarAction 
					message={message}
					me={me}
					/>}
					{message.messageType==="text" && <TextMessage message={message}/>}
					{message.messageType==="image" && <ImageMessage message={message}  />}
					{message.messageType==="video" && <VideoMessage message={message}  />}
					
					<MessageTime time={time} fromMe = {fromMe}/>

				</div>
			</div>
		</>
		);
	}
	return <>
	<DateIndicator message={message} previousMessage={perviousMessage}/>
	<div className="flex gap-1 w-2/3 ml-auto">
		<div className={`flex  z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ml-auto ${bgClass}`}>
			<SelfMessageIndicator/>
			{message.messageType==="text" && <TextMessage message={message}/>}
			{message.messageType==="image" && <ImageMessage message={message}  />}
			{message.messageType==="video" && <VideoMessage message={message}  />}
			<MessageTime time={time} fromMe = {fromMe}/>

		</div>
	</div>
</>

	
};
export default ChatBubble;
const VideoMessage = ({ message }: { message: IMessage }) => {
	return <ReactPlayer url={message.content} width='250px' height='250px' controls={true} light={true} />;
};
const ImageMessage = ({ message }: { message: IMessage }) => {
	return (
		<div className='w-[250px] h-[250px] m-2 relative'>
			<Image
				src={message.content}
				fill
				className='cursor-pointer object-cover rounded'
				alt='image'
			
			/>
		</div>
	);
};
const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => {
	return (
		<p className='text-[10px] mt-2 self-end flex gap-1 items-center'>
			{time} {fromMe && <MessageSeenSvg />}
		</p>
	);
};
const SelfMessageIndicator = () => (
	<div className='absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden' />
);
const OtherMessageIndicator = () => (
	<div className='absolute bg-white dark:bg-gray-primary top-0 -left-[4px] w-3 h-3 rounded-bl-full' />
);
const TextMessage = ({ message }: { message: IMessage }) => {
	const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

	return (
		<div>
			{isLink ? (
				<a
					href={message.content}
					target='_blank'
					rel='noopener noreferrer'
					className={`mr-2 text-sm font-light text-blue-400 underline`}
				>
					{message.content}
				</a>
			) : (
				<p className={`mr-2 text-sm font-light`}>{message.content}</p>
			)}
		</div>
	);
};
