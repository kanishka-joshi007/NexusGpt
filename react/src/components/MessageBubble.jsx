
import React, { useEffect } from 'react'
import { assets } from '../assets/assets';
import moment from 'moment';
import Markdown from 'react-markdown';
import prism from 'prismjs';

const MessageBubble = ({ message }) => {

 useEffect(() => {
    if (message?.content) {
      prism.highlightAll()
    }
  }, [message])

  if (!message) return null;

  return (
    <div>
      {message.role === "user" ? (

        <div className='flex items-start justify-end gap-2 my-4'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 
              border border-[80609F]/30 rounded-md max-w-2xl'>
                <p className='text-sm dark:text-primary'>{message.content}</p>
                <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{moment(message.timestamp).fromNow()}</span>
          </div>

          <img src={assets.user_icon} className='w-8 rounded-full' alt="" />

        </div>
      )
      : 
      (
        <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317c]/30
         border border-[#80609F]/30 rounded-md mt-2'>
         {message.isImage ? (
          <img src={message.content} alt="Generated" className='max-w-75 rounded-md mt-2 cursor-pointer hover:scale-105 transition'/>
         ) 
         :
         ( 
          <div className='text-sm dark:text-primary reset-tw'>
             <Markdown>{message.content}</Markdown>
          </div> 
         )}
          <span>{moment(message.timestamp).fromNow()}</span> 
        </div>
      )
    
    
    }
    </div>
  )
}

export default MessageBubble