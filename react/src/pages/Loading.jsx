import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatContext } from '../context/ChatContext';

const Loading = () => {
const navigate = useNavigate();
 const {fetchUser} = useChatContext();


useEffect(()=>{
const timeout = setTimeout(()=>{
  fetchUser()
  
 navigate('/')
},8000)
 return()=> clearTimeout(timeout)
},[])

  return (
    <div className='bg-linear-to-b from-[#531B81] to-[#29184B]
         backdrop-opacity-60 flex items-center justify-center h-screen w-screen
         text-white text-2xl'>

      <div className='h-10 w-10 rounded-full border-3 border-white border-t-transparent animate-spin'>
        
        </div>    

    </div>
  )
}

export default Loading