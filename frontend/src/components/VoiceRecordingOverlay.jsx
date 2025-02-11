import { useState } from "react";
import { motion } from "framer-motion";
import { FiMic, FiX } from "react-icons/fi";

function VoiceRecordingOverlay({ onClose, messages, status, isRecording }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-8">
        {/* Main Circle with Gradient */}
        <motion.div 
          className="relative w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, #ffffff 0%, #FAAE7B 100%)',
            filter: 'blur(1px)'
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Status Text */}
        <div className="text-sm font-medium text-white/90 tracking-wide">
          {isRecording ? "Listening..." : "Processing..."}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          <motion.button
            className="p-4 bg-[#2A2A2A] rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiMic className="h-6 w-6 text-[#FAAE7B]" />
          </motion.button>
          <motion.button
            onClick={onClose}
            className="p-4 bg-[#2A2A2A] rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiX className="h-6 w-6 text-[#FAAE7B]" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default VoiceRecordingOverlay; 