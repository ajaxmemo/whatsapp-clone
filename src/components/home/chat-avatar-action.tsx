import { IMessage, useConversationStore } from '@/store/chat-store'
import { useMutation } from 'convex/react'
import { Ban, LogOut, LogOutIcon } from 'lucide-react'
import React from 'react'
import { api } from '../../../convex/_generated/api'
type avatarActionProps ={
    message: IMessage,
    me: any
}
const ChatAvatarAction = ({message, me}:avatarActionProps) => {
    const {selectedConversation,setSelectedConversation} = useConversationStore();
    const isMember = selectedConversation?.participants.includes(message.sender._id);
    const kickUser = useMutation(api.coversations.kickUser);
    const createConversation = useMutation(api.coversations.createConversation);
    const kickUserGroup = async (e:React.MouseEvent) =>{
        e.stopPropagation();
        try {
            if(!selectedConversation) return;
            await kickUser({
                coversationId :selectedConversation._id,
                userId :message.sender._id
            });
            setSelectedConversation({
                ...selectedConversation,
                participants:selectedConversation.participants.filter((id)=> id !== message.sender._id)
            })
        } catch (error) {
            console.log(error);
            
        }
    }
    const handleCreateConversation = async () =>{
        try {
          const conversationId = await createConversation({
                participants: [message.sender._id,me?._id!],
                isGroup:false
            })
            setSelectedConversation({
				_id: conversationId,
				participants: [message.sender._id,me?._id!],
				isGroup:false,
				image: message.sender.image,
				name: message.sender.name,
				
			});
        } catch (error) {
            console.log(error);
            
        }
    }
  return (
    <div className='flex  font-bold text-[11px] gap-4 justify-between cursor-pointer group'
    onClick={handleCreateConversation}
    >
      {message.sender.name}
      {!isMember && <Ban   className='text-red-600' />}
      {isMember && selectedConversation?.admin == me._id && (
      <LogOut className=' text-red-600 opacity-0 group-hover:opacity-50'
      onClick={kickUserGroup}
      />
      )
      }
    </div>
  )
}

export default ChatAvatarAction
