import { useState, useRef, useEffect } from "react";
import { FiMic, FiSend } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { IoMdAttach } from "react-icons/io";
import { SiOpenai } from "react-icons/si";
import { TbBrandGoogleFilled } from "react-icons/tb";
import { SiClarifai } from "react-icons/si";
import { TbBrain } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { startSpeechToTextStreaming } from '../utils/speechToTextStreaming';
import { speakWithDeepgram } from '../utils/textToSpeech';
import VoiceRecordingOverlay from './VoiceRecordingOverlay';

function MessageInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [overlayMessages, setOverlayMessages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const stopRef = useRef(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-pro");
  const [models, setModels] = useState([
    { id: "gemini-pro", name: "Gemini Pro" },
    { id: "gemini-flash-2.0", name: "Gemini Flash 2.0" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt3-mini", name: "GPT3 Mini" },
    { id: "claude-3-opus", name: "Claude 3 Opus" },
    { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku" },
    { id: "llama-3.3-70b", name: "Llama 3.3 70B" },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const processingTimeoutRef = useRef(null);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');

  const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

  const handleVoiceInteraction = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (socketRef.current) socketRef.current.close();
      if (recorderRef.current) recorderRef.current.stop();
      if (stopRef.current) stopRef.current();
      return;
    }

    try {
      setIsRecording(true);
      setOverlayMessages([]);
      
      const handleTranscript = async (transcriptData) => {
        try {
          if (!transcriptData?.content || transcriptData.content.trim() === '') {
            return;
          }

          // Send user message
          onSendMessage(transcriptData.content, "user");

          try {
            const response = await fetch(`${PYTHON_API_URL}/voice-chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                message: transcriptData.content,
                model: selectedModel,
                systemPrompt: "You are a conversational assistant named Smith. Keep responses brief and natural."
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to get response from the server (${response.status}).`);
            }

            const data = await response.json();
            if (data.success && data.response) {
              // Send AI response
              onSendMessage(data.response, "assistant");

              // Handle text-to-speech
              if (!isMuted) {
                setIsAISpeaking(true);
                await speakWithDeepgram(data.response);
                setIsAISpeaking(false);
              }
            }
          } catch (error) {
            console.error('Error:', error);
            onSendMessage(`Error: ${error.message}`, "system");
          }
        } catch (error) {
          console.error('Transcript error:', error);
          onSendMessage("Failed to process transcript.", "system");
        }
      };

      const { socket, recorder, stop } = await startSpeechToTextStreaming(handleTranscript);
      socketRef.current = socket;
      recorderRef.current = recorder;
      stopRef.current = stop;
    } catch (error) {
      console.error('Error starting voice interaction:', error);
      setIsRecording(false);
      onSendMessage("Failed to start voice interaction.", "system");
    }
  };

  const handleOverlayClose = () => {
    if (isRecording) {
      // Stop all recording processes
      if (socketRef.current) socketRef.current.close();
      if (recorderRef.current) recorderRef.current.stop();
      if (stopRef.current) stopRef.current();
      
      setIsRecording(false);
      setOverlayMessages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    onSendMessage(message.trim(), "user");
    setMessage('');

    try {
      const response = await fetch(`${PYTHON_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get response from the server (${response.status}).`);
      }

      const data = await response.json();
      if (data.response) {
        onSendMessage(data.response, "assistant");
      }
    } catch (error) {
      console.error('Error:', error);
      onSendMessage(`Error: ${error.message}`, "system");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedFile(data.fileUrl);
      
      // Send a message about the uploaded file
      onSendMessage(`Uploaded file: ${file.name}`, "user");
    } catch (error) {
      console.error('Upload error:', error);
      onSendMessage("Failed to upload file. Please try again.", "system");
    }
  };

  const getModelIcon = (modelId) => {
    switch (modelId) {
      case "gemini-pro":
      case "gemini-flash-2.0":
        return <TbBrandGoogleFilled className="h-4 w-4 text-[#FAAE7B]" />;
      case "gpt-3.5-turbo":
      case "gpt-4o":
      case "gpt-4o-mini":
      case "gpt3-mini":
        return <SiOpenai className="h-4 w-4 text-[#FAAE7B]" />;
      case "claude-3-opus":
      case "claude-3.5-haiku":
        return <TbBrain className="h-4 w-4 text-[#FAAE7B]" />;
      case "llama-3.3-70b":
        return <SiClarifai className="h-4 w-4 text-[#FAAE7B]" />;
      default:
        return <HiSparkles className="h-4 w-4 text-[#FAAE7B]" />;
    }
  };

  

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (stopRef.current) {
        stopRef.current();
      }
      setIsAISpeaking(false);
    };
  }, []);

  return (
    <>
      <div className="px-2 sm:px-4 py-2 sm:py-4">
        <motion.form
          onSubmit={handleSubmit}
          className={`relative rounded-2xl transition-all duration-300 w-full max-w-3xl mx-auto ${
            isFocused 
              ? 'bg-white/10 shadow-lg shadow-white/5 border border-white/10' 
              : 'bg-white/5'
          }`}
        >
          <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 sm:p-3">
            <motion.button
              type="button"
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getModelIcon(selectedModel)}
              <span className="text-[10px] sm:text-xs text-[#FAAE7B]">
                {models.find(m => m.id === selectedModel)?.name}
              </span>
            </motion.button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Message Audio-Smith..."
              className="w-full sm:w-auto flex-1 bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-white/90 placeholder:text-white/40 focus:outline-none text-xs sm:text-sm rounded-xl transition-all duration-200 focus:bg-white/5"
            />

            <div className="flex items-center gap-1 sm:gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.mp4"
              />
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IoMdAttach className="h-4 w-4 text-[#FAAE7B] hover:text-[#E89B68] transition-colors duration-200" />
              </motion.button>

              <motion.button
                type="button"
                onClick={handleVoiceInteraction}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isRecording ? 'bg-red-500/20 hover:bg-red-500/30' : 'hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMic className={`h-4 w-4 transition-colors duration-200 ${
                  isRecording ? 'text-red-400' : 'text-[#FAAE7B] hover:text-[#E89B68]'
                }`} />
              </motion.button>

              <motion.button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  message.trim() ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90' : 'hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSend className={`h-4 w-4 transition-colors duration-200 ${
                  message.trim() ? 'text-white' : 'text-[#FAAE7B] hover:text-[#E89B68]'
                }`} />
              </motion.button>
            </div>
          </div>

          {isLoading && (
            <div className="absolute bottom-full left-0 right-0 mb-2 flex justify-center">
              <motion.div
                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/70"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Mr-Smith is thinking...
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {showModelSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 mb-2 w-[200px] sm:w-[300px] bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10 z-50"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={`p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs text-white/80 hover:bg-white/10 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 justify-center ${
                        selectedModel === model.id ? 'bg-white/20' : ''
                      }`}
                    >
                      {getModelIcon(model.id)}
                      <span className="hidden xs:inline">{model.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>

      {isRecording && (
        <VoiceRecordingOverlay
          onClose={handleOverlayClose}
          isRecording={isRecording}
          onMuteToggle={(muted) => setIsMuted(muted)}
        />
      )}
    </>
  );
}

export default MessageInput;

