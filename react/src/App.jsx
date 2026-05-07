
import Sidebar from "./components/Sidebar"
import { Route, Routes, useLocation } from "react-router-dom"
import Credits from "./pages/Credits"
import Community from "./pages/Community"
import ChatArea from "./components/ChatArea"
import { useState } from "react"
import { assets } from "./assets/assets"
import "./assets/prism.css"
import Loading from "./pages/Loading"
import { useChatContext } from "./context/ChatContext"
import Login from "./pages/Login"
import {Toaster} from "react-hot-toast"

function App() {

  const {user, loadingUser} = useChatContext()
   
  const [ismenuopen, setIsMenuOpen] = useState(false)
  
  const {pathname} = useLocation()
   if(pathname === '/loading' || loadingUser) return <Loading/>

  return (
    <>
        
        <Toaster/>

     {!ismenuopen && <img src={assets.menu_icon} className='absolute left-3 top-3 w-5 h-5 cursor-pointer md:hidden
                        not-dark:invert' alt="" onClick={()=>setIsMenuOpen(true)} />}

          {user ? (
        
        <div className="dark:bg-linear-to-b from-[#242124] to-[#000000] dark:text-white">

        <div className="flex h-screen w-screen">
          
          <Sidebar ismenuopen={ismenuopen} setIsMenuOpen={setIsMenuOpen}/>

          <Routes>
            <Route path="/" element={<ChatArea/>}/>
            <Route path="/credits" element={<Credits/>}/>
            <Route path="/Community" element={<Community/>}/>
          </Routes>

        </div>
        
      </div>

          ):(

            <div className="bg-linear-to-b from-[#242124] to-[#000000] flex
            items-center justify-center h-screen w-screen">
              <Login/>
            </div>

          )}              

      
    </> 
  )
}


export default App


