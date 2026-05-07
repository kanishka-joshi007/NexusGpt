import React, { useEffect, useState } from 'react'
import { dummyPublishedImages } from '../assets/assets'
import Loading from './Loading'
import { useChatContext } from '../context/ChatContext'
import toast from 'react-hot-toast'

const Community = () => {

const [images, setImages] = useState([])
const [loading, setLoading] = useState(true)
const {axios, token} = useChatContext();

const fetchImages = async () => {
  setLoading(true);

  try {
    const { data } = await axios.get('/api/user/published-images', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data.success) {
      setImages(data.images);
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);

  } finally {
    setLoading(false);
  }
};

console.log("IMAGES:", images)

useEffect(() => {
  if (!token) return;

  fetchImages();

  const handler = () => fetchImages();

  window.addEventListener("refreshCommunity", handler);

  return () => window.removeEventListener("refreshCommunity", handler);
}, [token]);

if(loading) return <Loading/>

 return (
    <div className='p-6 pt-12 xl:px-12 2xl:px-20 w-full mx-auto h-full overflow-y-scroll'>
     <h2 className='text-xl font-semibold mb-6 text-gray-800
            dark:text-purple-100'>Community Images</h2>

            {images.length > 0 ? (
              <div className='flex flex-wrap max-sm:justify-center gap-5'>
                {images.map((item, index) => (

                  <a key={index} target='_blank' href={item.imageUrl} className=' w-48 relative group block rounded-lg overflow-hidden border 
                   border:gray-200 dark:border-purple-700 shadow-sm 
                   hoverf:shadow-md transition-shadow duration-300' >

                    <img src={item.imageUrl} className='w-full h-40 md:h-50 bg-red-200
                    2xl:h-62 object-cover group-hover:scale-105 transition-transform 
                    duration-300 ease-in-out' alt="" />
                  
                  <p className='absolute right-0 bottom-0 text-xs bg-black/50
                  backdrop-blur text-white px-4 py-1 rounded-tl-xl opacity-0
                   group-hover:opacity-100 transition duration-300'>Created by {item.userName}</p>

                  </a>
                ))}

              </div>
            ) : (
              <p className=' text-center text-gray-600 dark:text-purple-200
                mt-10'>No images available.</p>
            )}
    </div>
  )
}

export default Community