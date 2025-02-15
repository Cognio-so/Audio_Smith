import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX, FiMic, FiMicOff } from "react-icons/fi";

function VoiceRecordingOverlay({ onClose, isRecording, onMuteToggle }) {
  const [intensity, setIntensity] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setIntensity(Math.random() * 0.3 + 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (onMuteToggle) {
      onMuteToggle(!isMuted);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative w-[400px] h-[400px]">
        {/* Base orb with immediate appearance */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            initial={{ scale: 1 }}
            className="w-full h-full bg-gradient-to-r from-[#cc2b5e] to-[#753a88]"
            animate={{
              scale: isRecording ? [1, intensity, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Outer glow layer */}
        <div className="absolute inset-[-20px] rounded-full opacity-40">
          <motion.div
            initial={{ scale: 1 }}
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, #cc2b5e 70%, #753a88 100%)',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: isRecording ? [1, intensity * 1.1, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
        </div>

        {/* Inner bright core */}
        <div className="absolute inset-[60px] rounded-full">
          <motion.div
            initial={{ scale: 1 }}
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle at center, white 0%, #cc2b5e 30%, transparent 70%)',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: isRecording ? [1, intensity * 0.9, 1] : 1,
              opacity: isRecording ? [0.7, 0.9, 0.7] : 0.7,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Dynamic color swirl */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            initial={{ rotate: 0 }}
            className="w-full h-full"
            style={{
              background: 'conic-gradient(from 0deg, #cc2b5e, #753a88, #cc2b5e)',
              opacity: 0.4,
              filter: 'blur(20px)',
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Glass effect overlay */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
            backdropFilter: 'blur(5px)',
          }}
        />

        {/* Bottom buttons container */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-4">
          <button
            onClick={handleMuteToggle}
            className="p-4 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 transition-colors"
          >
            {isMuted ? (
              <FiMicOff className="w-6 h-6 text-[#cc2b5e]" />
            ) : (
              <FiMic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-4 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default VoiceRecordingOverlay; 