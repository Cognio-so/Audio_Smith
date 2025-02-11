import { useState, useEffect, useRef } from "react"
import MessageInput from "./MessageInput"
import { motion, AnimatePresence } from "framer-motion"
import { FiUser } from "react-icons/fi"
import { BsChatLeftText } from "react-icons/bs"
import { HiSparkles } from "react-icons/hi"
import { speakWithDeepgram, stopSpeaking } from '../utils/textToSpeech'
import { sendEmailWithPDF } from '../utils/emailService'
import { useAuth } from '../context/AuthContext'

function ChatContainer({ activeChat, onUpdateChatTitle }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const [streamingText, setStreamingText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Reset states and save previous chat when activeChat changes
  useEffect(() => {
    const savePreviousChat = async () => {
      if (messages.length > 0 && activeChat?.id) {
        await saveConversation();
      }
    };

    // Save previous chat before loading new one
    savePreviousChat();
    
    // Reset states for new chat
    setMessages([]);
    setIsFirstMessage(true);
  }, [activeChat?.id]);

  // Save chat when window/tab closes
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (messages.length > 0) {
        e.preventDefault();
        e.returnValue = '';
        await saveConversation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  const saveConversation = async () => {
    // Only try to save if we have an activeChat
    if (!activeChat?.id || messages.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Saving entire conversation:', {
        chatId: activeChat.id,
        title: activeChat.title,
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
        const errorData = await response.json();
        console.error('Save chat error:', errorData);
        throw new Error('Failed to save chat');
      }

      const data = await response.json();
      console.log('Chat saved successfully:', data);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      if (messages.length > 0) {
        saveConversation();
      }
    };
  }, []);

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
    console.log("Adding message:", { content, role });

    if (role === "user") {
      setIsFirstMessage(false);
      setIsLoading(true); // Set loading when user sends message
    } else {
      setIsLoading(false); // Clear loading when AI responds
    }

    setMessages(prev => [
      ...prev,
      {
        content: content,
        role: role,
        timestamp: new Date().toISOString(),
      },
    ]);
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
      className={`mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role !== "user" && (
        <motion.div
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-white/10"
          whileHover={{ scale: 1.05 }}
        >
          <HiSparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#FAAE7B]" />
        </motion.div>
      )}

      <div className={`max-w-[75%] sm:max-w-[60%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl backdrop-blur-sm ${
        message.role === "user" 
          ? "bg-gradient-to-br from-orange-500/20 to-rose-500/20 text-white shadow-lg shadow-black/10 border border-white/10" 
          : "bg-white/5 text-slate-200 shadow-lg shadow-black/10 border border-white/5"
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
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#232526]/40 flex items-center justify-center">
          <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-[#FAAE7B]" />
        </div>
      )}
    </motion.div>
  )

  // Load messages when activeChat changes
  useEffect(() => {
    if (activeChat?.messages) {
      console.log('Loading messages from activeChat:', activeChat.messages); // Debug log
      setMessages(activeChat.messages);
      setIsFirstMessage(false);
    } else {
      setMessages([]);
      setIsFirstMessage(true);
    }
  }, [activeChat]);

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Header */}
      <div className="px-2 sm:px-4 py-3 sm:py-5 flex items-center border-b border-white/10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <BsChatLeftText className="h-4 sm:h-5 w-4 sm:w-5 text-[#FAAE7B]" />
          <span className="text-white font-medium text-sm sm:text-base">Audio-Smith</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}`}
            initial="hidden"
            animate="visible"
            variants={messageVariants}
            className={`mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role !== "user" && (
              <motion.div
                className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-white/10"
                whileHover={{ scale: 1.05 }}
              >
                <HiSparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#FAAE7B]" />
              </motion.div>
            )}

            <div className={`max-w-[75%] sm:max-w-[60%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl backdrop-blur-sm ${
              message.role === "user" 
                ? "bg-gradient-to-br from-orange-500/20 to-rose-500/20 text-white shadow-lg shadow-black/10 border border-white/10" 
                : "bg-white/5 text-slate-200 shadow-lg shadow-black/10 border border-white/5"
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
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#232526]/40 flex items-center justify-center">
                <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-[#FAAE7B]" />
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Predefined Prompts and Input */}
      <div className={`w-full ${isFirstMessage ? 'absolute top-1/2 -translate-y-1/2' : 'relative'}`}>
        {isFirstMessage && (
          <div className="mb-4 sm:mb-6 px-2 sm:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
              {predefinedPrompts.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => handlePromptClick(item.prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-white/90 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-[10px] sm:text-xs line-clamp-2">
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

