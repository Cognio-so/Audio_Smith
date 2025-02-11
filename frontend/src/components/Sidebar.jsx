import { useState, useEffect } from "react"
import { FiUser, FiLogOut, FiSearch, FiPlus } from "react-icons/fi"
import { IoChatboxEllipses } from "react-icons/io5"
import { BsLayoutSidebar } from "react-icons/bs"
import { useAuth } from "../context/AuthContext"
import VoiceRecordingOverlay from "./VoiceRecordingOverlay"
import { AnimatePresence, motion } from "framer-motion"

function Sidebar({ chats, activeChat, setActiveChat, createNewChat }) {
  const { user, logout } = useAuth()
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  useEffect(() => {
    loadChatHistory();
  }, [chats]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chats/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      console.log('Loaded chat history:', data);

      if (data.success && data.chats) {
        // Remove duplicates by chatId
        const uniqueChats = data.chats.reduce((acc, chat) => {
          if (!acc.some(existingChat => existingChat.chatId === chat.chatId)) {
            acc.push(chat);
          }
          return acc;
        }, []);

        // Transform the chat history data
        const formattedChats = uniqueChats.map(chat => ({
          id: chat.chatId,
          title: chat.title || 'New Chat',
          messages: chat.conversation || []
        }));

        setChatHistory(formattedChats);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleNewChat = () => {
    setSearchQuery("")
    createNewChat()
    // Reload chat history after creating new chat
    loadChatHistory()
  }

  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort chats by last updated time (most recent first)
  const sortedChats = [...filteredChats].sort((a, b) => {
    const dateA = new Date(a.lastUpdated || 0);
    const dateB = new Date(b.lastUpdated || 0);
    return dateB - dateA;
  });

  const handleChatClick = async (chat) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chats/${chat.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded chat data:', data); // Debug log

        if (data.success && data.chat) {
          // Create a new chat object with the conversation
          const updatedChat = {
            id: data.chat.chatId,
            title: data.chat.title || 'New Chat',
            messages: data.chat.conversation || [] // Make sure to include all messages
          };
          console.log('Updated chat object:', updatedChat); // Debug log
          setActiveChat(updatedChat); // Set this as the active chat
        }
      } else {
        console.error('Failed to load chat:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  return (
    <div className="relative flex">
      <div 
        className={`${
          isSidebarCollapsed ? 'w-14' : 'w-56'
        } bg-gradient-to-l from-[#232526] to-[#414345] p-3 flex flex-col transition-all duration-300 ease-in-out border-r border-white/10`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BsLayoutSidebar 
              className="h-5 w-5 text-[#FAAE7B] cursor-pointer hover:text-white transition-colors"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            {!isSidebarCollapsed && (
              <span className="text-sm font-semibold text-slate-100">Mr Smith</span>
            )}
          </div>
          <button 
            onClick={handleNewChat}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors duration-200"
          >
            <FiPlus className="h-4 w-4 text-[#FAAE7B] hover:text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FAAE7B]" />
          <input
            type="text"
            placeholder={isSidebarCollapsed ? "Search" : "Search chats..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 rounded-md py-1.5 pl-8 pr-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FAAE7B]/50"
          />
        </div>

        <div className="flex-grow overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`py-1.5 px-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors duration-200 flex items-center ${
                activeChat?.id === chat.id ? 'bg-white/10' : ''
              }`}
              onClick={() => handleChatClick(chat)}
            >
              <IoChatboxEllipses className="h-4 w-4 text-[#FAAE7B]" />
              {!isSidebarCollapsed && (
                <span className="ml-2 text-sm text-slate-300 truncate">
                  {chat.title || 'New Chat'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Voice Recording Overlay */}
        <AnimatePresence>
          {isRecording && (
            <motion.div className="mb-3">
              <VoiceRecordingOverlay
                isRecording={isRecording}
                onClose={() => setIsRecording(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mt-auto pt-3">
          <button
            className="p-1.5 w-full bg-white/5 rounded-md hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            onClick={() => setShowUserDetails(!showUserDetails)}
          >
            <FiUser className="h-4 w-4 text-[#FAAE7B]" />
            {!isSidebarCollapsed && <span className="ml-2 text-sm text-slate-200">Profile</span>}
          </button>
          {showUserDetails && (
            <div className={`absolute bottom-full ${
              isSidebarCollapsed ? 'left-0 translate-x-2' : 'left-0'
            } right-0 mb-2 p-2 bg-[#232526] rounded-md shadow-lg border border-white/10 z-50`}>
              <h3 className="font-medium text-sm mb-1 text-slate-100 truncate">{user?.name}</h3>
              <p className="text-slate-400 text-xs mb-2 truncate">{user?.email}</p>
              <button 
                onClick={logout}
                className="flex items-center text-red-400 hover:text-red-300 text-xs w-full"
              >
                <FiLogOut className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Removed external slider button since we moved it to the top */}
    </div>
  )
}

export default Sidebar

