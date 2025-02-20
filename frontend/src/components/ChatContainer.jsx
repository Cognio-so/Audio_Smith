import { useState, useEffect, useRef } from "react"
import MessageInput from "./MessageInput"
import { motion, AnimatePresence } from "framer-motion"
import { FiUser } from "react-icons/fi"
import { BsChatLeftText } from "react-icons/bs"
import { HiSparkles } from "react-icons/hi"
import { speakWithDeepgram, stopSpeaking } from '../utils/textToSpeech'
import { sendEmailWithPDF } from '../utils/emailService'
import { useAuth } from '../context/AuthContext'

function ChatContainer({ activeChat, onUpdateChatTitle, isOpen }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const [streamingText, setStreamingText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  // Load messages when component mounts and when activeChat changes
  useEffect(() => {
    const loadChat = async () => {
      if (!activeChat?.id) return;
      
      setIsLoadingChat(true);
      
      // For new chats (temporary IDs), don't try to load from backend
      if (activeChat.id.toString().startsWith(Date.now().toString().slice(0, -4))) {
        setMessages([]);
        setIsFirstMessage(true);
        setIsLoadingChat(false);
        return;
      }
      
      // First try to load from localStorage for immediate display
      const savedMessages = localStorage.getItem(`chat_${activeChat.id}`);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        setIsFirstMessage(parsedMessages.length === 0);
      }

      // Add retry logic with exponential backoff
      const fetchWithRetry = async (retryCount = 0, maxRetries = 3) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/chats/${activeChat.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          // If chat doesn't exist yet, treat it as a new chat
          if (response.status === 404) {
            setMessages([]);
            setIsFirstMessage(true);
            return null;
          }

          if (!response.ok) {
            throw new Error(`Failed to load chat: ${response.status}`);
          }

          const data = await response.json();
          return data;

        } catch (error) {
          if (retryCount < maxRetries && error.message.includes('Rate limit')) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(retryCount + 1, maxRetries);
          }
          throw error;
        }
      };

      try {
        const data = await fetchWithRetry();
        
        if (data) {  // Only process data if it exists
          if (data.chat && data.chat.conversation) {
            const formattedMessages = data.chat.conversation.map(msg => ({
              content: msg.content,
              role: msg.role,
              timestamp: msg.timestamp || new Date().toISOString()
            }));
            
            setMessages(formattedMessages);
            localStorage.setItem(`chat_${activeChat.id}`, JSON.stringify(formattedMessages));
            setIsFirstMessage(formattedMessages.length === 0);
          } else if (data.conversation) {
            const formattedMessages = data.conversation.map(msg => ({
              content: msg.content,
              role: msg.role,
              timestamp: msg.timestamp || new Date().toISOString()
            }));
            
            setMessages(formattedMessages);
            localStorage.setItem(`chat_${activeChat.id}`, JSON.stringify(formattedMessages));
            setIsFirstMessage(formattedMessages.length === 0);
          }
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        // Don't show error message for 404s on new chats
        if (!error.message.includes('404')) {
          setMessages(prev => [...prev, {
            content: `Error: ${error.message}. Using cached data if available.`,
            role: "system",
            timestamp: new Date().toISOString()
          }]);
        }
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChat();
  }, [activeChat?.id]);

  // Save chat when messages change
  useEffect(() => {
    const debouncedSave = setTimeout(() => {
      if (messages.length > 0 && activeChat?.id) {
        saveConversation();
      }
    }, 1000);

    return () => clearTimeout(debouncedSave);
  }, [messages, activeChat?.id]);

  const saveConversation = async () => {
    if (!activeChat?.id || messages.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Saving conversation:', {
        chatId: activeChat.id,
        messageCount: messages.length
      });

      const response = await fetch('http://localhost:5000/api/chats/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId: activeChat.id,
          title: activeChat.title || 'New Chat',
          conversation: messages.map(msg => ({
            content: msg.content,
            role: msg.role,
            timestamp: msg.timestamp
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save chat');
      }

      const data = await response.json();
      console.log('Chat saved successfully:', data);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // Save chat before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (messages.length > 0 && activeChat?.id) {
        // Synchronous save before unload
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/chats/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            chatId: activeChat.id,
            title: activeChat.title || 'New Chat',
            conversation: messages
          }),
          // Make this request synchronous
          keepalive: true
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, activeChat]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const predefinedPrompts = [
    {
      id: 1,
      title: "Audio Analysis",
      prompt: "Analyze this audio file and provide detailed feedback on its quality, composition, and potential improvements."
    },
    {
      id: 2,
      title: "Music Production",
      prompt: "Help me create a production plan for my track, including mixing and mastering steps."
    },
    {
      id: 3,
      title: "Sound Design",
      prompt: "Guide me through creating unique sound effects for my project using synthesis techniques."
    }
  ];

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const handlePromptClick = (promptText) => {
    addMessage(promptText, "user");
    setIsFirstMessage(false);
  };

  const generateChatTitle = (text) => {
    const cleanText = text.trim().replace(/[^\w\s]/gi, ' ');
    const words = cleanText.split(/\s+/);
    return words.slice(0, 3).join(' ');
  };

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const typewriterEffect = (text, callback) => {
    let i = 0;
    const speed = 20; // Adjust speed of typing (lower = faster)
    let currentText = '';

    const type = () => {
      if (i < text.length) {
        currentText += text.charAt(i);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: currentText,
            isTyping: true
          };
          return newMessages;
        });
        i++;
        setTimeout(type, speed);
      } else {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            isTyping: false
          };
          return newMessages;
        });
        if (callback) callback();
      }
    };

    type();
  };

  const handleEmailRequest = async (recentMessages) => {
    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Get the last 10 messages or all messages if less than 10
      const lastMessages = recentMessages.slice(-10);
      
      // Send email with the messages
      const result = await sendEmailWithPDF(
        user.email,
        lastMessages,
        `Chat Summary - ${activeChat?.title || 'AI Conversation'}`
      );

      console.log('Email send result:', result);

      // Add success message
      setMessages(prev => [...prev, {
        content: `✅ I've sent the email to ${user.email} with our conversation. Please check your inbox!`,
        role: "assistant",
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Email send error:', error);
      
      setMessages(prev => [...prev, {
        content: `❌ Sorry, I couldn't send the email: ${error.message}. Please try again or contact support if the issue persists.`,
        role: "assistant",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const addMessage = async (content, role) => {
    const newMessage = {
      content,
      role,
      timestamp: new Date().toISOString()
    };

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      // Save to localStorage immediately
      if (activeChat?.id) {
        localStorage.setItem(`chat_${activeChat.id}`, JSON.stringify(updatedMessages));
      }
      return updatedMessages;
    });

    if (role === "user") {
      setIsFirstMessage(false);
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  const handleStopResponse = () => {
    stopSpeaking();
  };

  const renderMessage = (message, index) => (
    <motion.div
      key={`${message.role}-${index}`}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      className={`flex items-start gap-3 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role !== "user" && (
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#cc2b5e] to-[#753a88] flex items-center justify-center border border-white/10 shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <HiSparkles className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${
        message.role === "user" 
          ? "bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white/90 border border-white/10" 
          : "bg-[#1a1a1a] text-slate-200 border border-white/10"
      }`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
            {message.isTyping && (
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block ml-1 text-[#FAAE7B]"
              >
                ▋
              </motion.span>
            )}
          </p>
        </motion.div>
      </div>

      {message.role === "user" && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 shadow-lg">
          <FiUser className="w-4 h-4 text-[#FAAE7B]" />
        </div>
      )}
    </motion.div>
  )

  // Add loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-start gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] animate-pulse" />
          <div className={`max-w-[70%] h-20 rounded-2xl animate-pulse ${
            i % 2 === 0 
              ? 'bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]' 
              : 'bg-[#1a1a1a]'
          }`} />
          {i % 2 === 0 && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] animate-pulse" />}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col relative h-screen bg-[#0a0a0a] ${
      isOpen ? 'lg:ml-0' : 'lg:ml-0'
    } transition-all duration-300`}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-3 sm:px-4 py-3 sm:py-4 flex items-center bg-[#0a0a0a]/80 backdrop-blur-lg h-[60px]">
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
            {/* Logo - Visible only on mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10">
                <img
                  src="/vannipro.png"
                  alt="Vaani.pro Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl font-display font-bold text-white leading-none py-1">
                Vanni.pro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 space-y-4 sm:space-y-6 bg-[#0a0a0a]">
        {isLoadingChat ? (
          <LoadingSkeleton />
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className={`flex items-start gap-2 sm:gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role !== "user" && (
                  <motion.div
                    className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#cc2b5e] to-[#753a88] flex items-center justify-center border border-white/10 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <HiSparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                )}

                <div className={`max-w-[75%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg ${
                  message.role === "user" 
                    ? "bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white/90 border border-white/10" 
                    : "bg-[#1a1a1a] text-slate-200 border border-white/10"
                }`}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                  >
                    <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                      {message.content}
                      {message.isTyping && (
                        <motion.span
                          animate={{ opacity: [0, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block ml-1 text-[#FAAE7B]"
                        >
                          ▋
                        </motion.span>
                      )}
                    </p>
                  </motion.div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 shadow-lg">
                    <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-[#FAAE7B]" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-lg">
                  <motion.span
                    className="w-2 h-2 bg-[#cc2b5e] rounded-full shadow-md"
                    animate={{ y: ["0%", "-50%", "0%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-[#cc2b5e] rounded-full shadow-md"
                    animate={{ y: ["0%", "-50%", "0%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-[#cc2b5e] rounded-full shadow-md"
                    animate={{ y: ["0%", "-50%", "0%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Predefined Prompts - Improved card design */}
      <div className={`w-full ${isFirstMessage ? 'absolute top-1/2 -translate-y-1/2' : 'relative'}`}>
        {isFirstMessage && (
          <div className="px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {predefinedPrompts.map((item) => (
                <motion.div
                  key={item.id}
                  className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden shadow-lg"
                  onClick={() => handlePromptClick(item.prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl" />
                  <h3 className="text-white/90 font-medium text-sm mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {item.prompt}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <MessageInput 
          onSendMessage={addMessage}
          isLoading={isLoading}
          onStopResponse={stopSpeaking}
        />
      </div>
    </div>
  );
}

export default ChatContainer;

