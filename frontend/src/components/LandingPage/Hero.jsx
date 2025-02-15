import { motion } from "framer-motion";
import { Mic, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto px-4 relative"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 0 0 rgba(121, 40, 202, 0)",
              "0 0 0 20px rgba(121, 40, 202, 0.2)",
              "0 0 0 0 rgba(121, 40, 202, 0)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-12 relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary opacity-20 blur-xl" />
          <Mic className="w-12 h-12 text-white relative z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
            Your Voice is Your Command
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
            Experience the future of AI interaction with Vaani.pro - Your intelligent voice-controlled assistant for research, analysis, and creation
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-primary/50 transition-all duration-300"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
            <Link to="/dashboard"><span className="relative flex items-center gap-2">
              Get Started <Wand2 className="w-4 h-4" />
            </span></Link>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="absolute -z-10 inset-0 blur-3xl"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(121, 40, 202, 0.1) 0%, transparent 50%)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default Hero;