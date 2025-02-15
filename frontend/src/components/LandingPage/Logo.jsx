import { motion } from "framer-motion";

const Logo = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative w-12 h-12 transform-gpu"
      >
        {/* Logo image */}
        <motion.img
          src="/vaani-pro.png" // Update this path based on where you saved the image
          alt="Vaani.pro Logo"
          className="w-full h-full object-contain"
          whileHover={{
            filter: "drop-shadow(0 0 20px rgba(121, 40, 202, 0.5))"
          }}
        />
      </motion.div>

      {/* Company name with glowing effect */}
      <motion.span 
        className="text-xl font-display font-bold"
        animate={{
          color: ["#ffffff", "#e0e0e0", "#ffffff"],
          textShadow: [
            "0 0 5px rgba(255,255,255,0.2)",
            "0 0 10px rgba(255,255,255,0.4)",
            "0 0 5px rgba(255,255,255,0.2)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        vaani.pro
      </motion.span>
    </motion.div>
  );
};

export default Logo;