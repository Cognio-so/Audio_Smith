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

  const handleClose = () => {
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="relative w-[400px] h-[400px]">
        {/* Base orb */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
          animate={{
            scale: isRecording ? [1, intensity, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Outer glow layer */}
        <motion.div
          className="absolute inset-[-20px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, #4F46E5 70%, #A855F7 100%)',
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

        {/* Inner bright core */}
        <motion.div
          className="absolute inset-[60px] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, white 0%, #93C5FD 30%, transparent 70%)',
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

        {/* Dynamic color swirl */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #3B82F6, #8B5CF6, #3B82F6)',
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

        {/* Glass effect overlay */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
            backdropFilter: 'blur(5px)',
          }}
        />

        {/* Bottom buttons container - adjusted position */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-4">
          {/* Mute toggle button */}
          <motion.button
            onClick={handleMuteToggle}
            className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? (
              <FiMicOff className="w-6 h-6 text-red-500" />
            ) : (
              <FiMic className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Close button */}
          <motion.button
            onClick={handleClose}
            className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <FiX className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default VoiceRecordingOverlay; 