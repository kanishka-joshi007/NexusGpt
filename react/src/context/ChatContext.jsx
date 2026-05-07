import { useEffect, createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [token, setToken] = useState(() => {
    const raw = localStorage.getItem("token");
    return raw && raw !== "undefined" && raw !== "null" ? raw : null;
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);

  // ================= USER =================
  const fetchUser = async () => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }

      toast.error(error.response?.data?.message || error.message);

    } finally {
      setLoadingUser(false);
    }
  };

  // ================= CREATE CHAT =================
  const createNewChat = async () => {
    try {
      if (!user) return toast("Login to create chat");

      const { data } = await axios.get("/api/chat/create", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setChats(prev => [data.chat, ...prev]);
        setSelectedChat(data.chat);
        navigate("/");
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= FETCH CHATS =================
  const fetchUserChats = async () => {

    if (!token || loadingChats) return;

    setLoadingChats(true);

    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {

        // ✅ FIX: overwrite only when data valid ho
        if (data.chats && data.chats.length > 0) {
          setChats(data.chats);

          // selected chat maintain karo
          setSelectedChat(prev =>
            prev
              ? data.chats.find(c => c._id === prev._id) || data.chats[0]
              : data.chats[0]
          );
        } else {
          // ❌ recursion remove
          await createNewChat();
        }

      } else {
        setUser(null);
        toast.error(data.message);
      }

    } catch (error) {
      setUser(null);
      toast.error(error.message);

    } finally {
      setLoadingChats(false);
    }
  };

  // ================= THEME =================
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // ================= USER CHANGE =================
  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  // ================= TOKEN CHANGE =================
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  // ================= VALUE =================
  const value = {
    navigate,
    user, setUser,
    chats, setChats,
    selectedChat, setSelectedChat,
    theme, setTheme,
    createNewChat,
    fetchUserChats,
    loadingUser,
    token, setToken,
    axios
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
export const useChatContext = () => useContext(ChatContext);