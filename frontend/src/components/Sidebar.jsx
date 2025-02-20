import { useState, useEffect } from "react"
import { FiUser, FiLogOut, FiSearch, FiPlus } from "react-icons/fi"
import { IoChatboxEllipses } from "react-icons/io5"
import { BsLayoutSidebar } from "react-icons/bs"
import { useAuth } from "../context/AuthContext"
import { HiMenuAlt2 } from "react-icons/hi"
import Logo from "./LandingPage/Logo"

function Sidebar({ chats, activeChat, setActiveChat, createNewChat, isOpen = false }) {
  const { user, logout } = useAuth()
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadChatHistory();
  }, [chats]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Add console.log to debug the token and request
      console.log('Attempting to load chat history with token:', token);

      const response = await fetch('http://localhost:5000/api/chats/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // Add this header
        },
        credentials: 'include'
      });
      
      // Add console.log to debug the response
      console.log('Chat history response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Failed to load chat history: ${response.status}`);
      }

      const data = await response.json();
      console.log('Loaded chat history data:', data);

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
        console.log('Formatted chat history:', formattedChats);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(), // Temporary ID until backend creates one
      title: 'New Chat',
      messages: []
    };
    
    setActiveChat(newChat);
    setSearchQuery("");
    createNewChat(newChat); // Pass the new chat object to parent component
    loadChatHistory();
  };

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

  // Mobile menu button handler
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="relative flex">
      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileMenuClick}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a1a1a] border border-white/10 hover:bg-white/5 transition-colors"
      >
        <HiMenuAlt2 className="h-5 w-5 text-[#cc2b5e]" />
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div 
        className={`${
          isSidebarCollapsed ? 'w-14 sm:w-16' : 'w-64'
        } h-screen bg-[#0a0a0a] flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 fixed lg:static z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 px-3 py-4 bg-[#0a0a0a]/80 backdrop-blur-lg">
          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col space-y-4' : 'justify-between'} w-full`}>
            {/* Logo Section - Hidden on mobile */}
            <div className="hidden lg:flex items-center justify-end w-full lg:justify-start gap-3">
              {isSidebarCollapsed ? (
                <div className="w-8 h-8">
                  <img
                    src="/vannipro.png"
                    alt="Vaani.pro Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12">
                    <img
                      src="/vannipro.png"
                      alt="Vaani.pro Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xl font-display font-bold text-white leading-none py-1">Vanni.pro</span>
                </div>
              )}
            </div>
            
            {/* Collapse Button - Only show on desktop */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors hidden lg:flex items-center justify-center"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <BsLayoutSidebar 
                className={`h-5 w-5 text-[#cc2b5e] hover:text-[#753a88] transition-transform duration-300 ${
                  isSidebarCollapsed ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>

        {/* New Chat Button - Reduced container size */}
        <div className="px-3 py-2 lg:mt-0 mt-4">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10 ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="pt-1.5">
              <FiPlus className="h-4 w-4 text-[#cc2b5e]" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-sm text-slate-200">New Chat</span>
            )}
          </button>
        </div>

        {/* Search Bar - Reduced container size */}
        <div className="px-3 py-2">
          <div className={`relative flex items-center w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            {!isSidebarCollapsed && (
              <div className="absolute left-3 flex items-center pointer-events-none mt-0.5">
                <FiSearch className="h-4 w-4 text-[#cc2b5e]" />
              </div>
            )}
            {isSidebarCollapsed ? (
              <button 
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
                title="Search"
              >
                <FiSearch className="h-5 w-5 text-[#cc2b5e] hover:text-[#753a88]" />
              </button>
            ) : (
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] rounded-lg py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#cc2b5e]/50 border border-white/10"
              />
            )}
          </div>
        </div>

        {/* Chat List - Further reduced spacing */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-1 space-y-0.5">
          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5 flex items-center gap-3
                ${activeChat?.id === chat.id ? 'bg-white/5' : ''}`}
              onClick={() => handleChatClick(chat)}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${
                activeChat?.id === chat.id 
                  ? 'from-[#cc2b5e] to-[#753a88]' 
                  : 'from-[#1a1a1a] to-[#2a2a2a]'
              } flex items-center justify-center border border-white/10 shadow-lg mt-0.5`}>
                <IoChatboxEllipses className={`h-4 w-4 ${
                  activeChat?.id === chat.id 
                    ? 'text-white' 
                    : 'text-slate-400 group-hover:text-[#cc2b5e]'
                }`} />
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-sm truncate ${
                  activeChat?.id === chat.id 
                    ? 'text-slate-200' 
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {chat.title || 'New Chat'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Profile Section */}
        <div className="relative p-3 border-t border-white/10">
          <button
            className="w-full px-3 py-3 bg-[#1a1a1a] rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3 border border-white/10"
            onClick={() => !isSidebarCollapsed && setShowUserDetails(!showUserDetails)}
            title={isSidebarCollapsed ? user?.name : "Profile"}
          >
            <FiUser className="h-4 w-4 text-[#cc2b5e] mt-0.5" />
            {!isSidebarCollapsed && (
              <span className="text-sm text-slate-200">Profile</span>
            )}
          </button>
          
          {showUserDetails && !isSidebarCollapsed && (
            <div className="absolute bottom-full mb-2 left-3 right-3 p-4 bg-[#1a1a1a] rounded-lg shadow-lg border border-white/10 backdrop-blur-lg">
              <h3 className="font-medium text-sm text-slate-100 truncate mb-1">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3 truncate">
                {user?.email}
              </p>
              <button 
                onClick={logout}
                className="flex items-center text-red-400 hover:text-red-300 text-sm w-full gap-2 transition-colors"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar

