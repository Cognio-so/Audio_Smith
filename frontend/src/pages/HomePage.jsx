import React from 'react';
import { FiUser, FiLogIn } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const heroVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#232526] to-[#414345] text-white">
      {/* Navbar */}
      <nav className="p-6 bg-[#232526]/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HiSparkles className="h-6 w-6 text-[#FAAE7B] animate-pulse" />
            <h1 className="text-2xl font-bold">Mr-Smith</h1>
          </motion.div>
          <motion.div 
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <a href="#features" className="hover:text-[#FAAE7B] transition-colors">Features</a>
            <a href="#about" className="hover:text-[#FAAE7B] transition-colors">About</a>
            <div className="flex items-center gap-4">
              <Link to="/login" className="flex items-center gap-2 hover:text-[#FAAE7B] transition-colors">
                <FiLogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="flex items-center gap-2 hover:text-[#FAAE7B] transition-colors">
                <FiUser className="h-5 w-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#FAAE7B] to-[#E89B68] bg-clip-text text-transparent">
            Revolutionize Your World with AI
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Experience the future of intelligent systems with our cutting-edge AI solutions
          </p>
          <motion.button 
            className="bg-gradient-to-r from-[#FAAE7B] to-[#E89B68] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard" className="relative z-10">Get Started</Link>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E89B68] to-[#FAAE7B] opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <HiSparkles className="h-6 w-6 text-[#FAAE7B]" />,
              title: "🤖 Intelligent Automation",
              description: "Streamline processes with AI-powered automation for maximum efficiency"
            },
            {
              icon: <HiSparkles className="h-6 w-6 text-[#FAAE7B]" />,
              title: "🧠 Deep Learning Models",
              description: "State-of-the-art neural networks for complex problem solving"
            },
            {
              icon: <HiSparkles className="h-6 w-6 text-[#FAAE7B]" />,
              title: "📊 Predictive Analytics",
              description: "Make data-driven decisions with our advanced predictive models"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gradient-to-b from-white/5 to-transparent rounded-lg border border-white/10 hover:border-[#FAAE7B]/30 transition-colors relative overflow-hidden"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="w-12 h-12 mb-4 bg-[#FAAE7B]/10 rounded-lg flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAAE7B]/10 to-[#E89B68]/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Demo Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-12">Experience AI in Action</h2>
          <div className="bg-gradient-to-b from-white/5 to-transparent p-8 rounded-lg border border-white/10 relative overflow-hidden">
            <p className="text-gray-300 mb-6">
              Our AI models can analyze, predict, and optimize in real-time. Here's a simple demonstration:
            </p>
            <div className="bg-[#232526] p-6 rounded-lg">
              <p className="text-gray-300">
                "The AI analyzed this text and determined it's about artificial intelligence with 95% confidence."
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAAE7B]/10 to-[#E89B68]/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
        </motion.div>
      </section>

      {/* Animated Background Elements */}
      <AnimatePresence>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-gradient-radial from-[#FAAE7B]/10 to-transparent"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: Math.random() * 2
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;