import React, { useEffect, useRef, useState } from 'react';
import { assets } from '../assets/assets';
import { useChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import logoLight from '../assets/Nlogo_full_dark.png';
import logoDark from '../assets/Nlogo_full.png';
import toast from 'react-hot-toast';

const ChatArea = () => {

  const containerRef = useRef(null);
  const prevChatIdRef = useRef(null);

  const { selectedChat, setSelectedChat, theme, user, axios, token, setUser } = useChatContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  // ================= SEND MESSAGE =================
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Login to send message");
      return;
    }

    if (!selectedChat?._id) {
      toast.error("No chat selected");
      return;
    }

    try {
      setLoading(true);

      const userMessage = {
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        isImage: false
      };

      const promptCopy = prompt;
      setPrompt("");

      // optimistic UI
      setMessages(prev => [...prev, userMessage]);

      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt,
          isPublished
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {

        // prevent duplicate
        setMessages(prev => {
          if (prev.find(m => m.timestamp === data.reply.timestamp)) return prev;
          return [...prev, data.reply];
        });

        // sync with selectedChat (VERY IMPORTANT)
       setSelectedChat(prev => ({ ...prev, messages: [ ...(prev?.messages || []), userMessage, data.reply ] }));

        // credits update
        setUser(prev => ({
          ...prev,
          credits: prev.credits - (mode === 'image' ? 2 : 1)
        }));


      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= CHAT SWITCH FIX =================
  useEffect(() => {
    if (!selectedChat) return;

    // ONLY update when chat actually changes
    if (prevChatIdRef.current !== selectedChat._id) {
      setMessages(selectedChat.messages || []);
      prevChatIdRef.current = selectedChat._id;
    }

  }, [selectedChat]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className='flex flex-1 flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-4 2xl:pr-40'>

      {/* CHAT MESSAGES */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>

        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center text-primary'>
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              className='relative w-full max-w-65 sm:mx-w-78'
              alt=""
            />
            <p className='absolute mt-24 text-3xl sm:text-5xl text-center text-gray-400 dark:text-white'>
              Ask me anything.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={msg.timestamp || index} message={msg} />
        ))}

        {/* LOADING */}
        {loading && (
          <div className='flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        )}

      </div>

      {/* IMAGE OPTION */}
      {mode === "image" && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>publish generated image to community</p>
          <input
            type="checkbox"
            className='cursor-pointer'
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* INPUT */}
      <form
        className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary/30
        dark:border-[#80609f]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'
        onSubmit={onSubmit}
      >

        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className='text-sm pl-3 pr-2 outline-none'
        >
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
        </select>

        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder='Type your prompt here...'
          className='flex-1 w-full text-sm outline-none'
          required
        />

        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt="Send"
            className='w-8 cursor-pointer'
          />
        </button>

      </form>

    </div>
  );
};

export default ChatArea;