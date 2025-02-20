import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Logo from '../LandingPage/Logo';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#111111] shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-4">
          {/* Logo and Navigation Links Group */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-lg sm:text-xl font-bold text-white">
                <img 
                  src="/vannipro.png" 
                  alt="Logo" 
                  className="h-8 w-auto"
                />
              </span>
            </Link>

            {/* Navigation Links - Moved next to logo */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
              <Link to="/" className="text-sm lg:text-base text-white hover:text-gray-300 transition-colors">
                Home
              </Link>
              <a href="#features" className="text-sm lg:text-base text-white hover:text-gray-300 transition-colors">
                Features
              </a>
              <a href="#About us" className="text-sm lg:text-base text-white hover:text-gray-300 transition-colors">
                About us
              </a>
              <a href="#Contact us" className="text-sm lg:text-base text-white hover:text-gray-300 transition-colors">
                Contact us
              </a>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Link 
              to="/login" 
              className="text-sm lg:text-base text-white hover:text-gray-300 transition-colors px-2"
            >
              Login
            </Link>
            
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Hidden by default) */}
      <div className="md:hidden">
        <div className={`${scrolled ? 'bg-[#111111]' : 'bg-black bg-opacity-90'} px-4 pt-2 pb-4 space-y-3`}>
          <Link to="/" className="block text-white hover:text-gray-300 transition-colors py-2">
            Home
          </Link>
          <a href="#features" className="block text-white hover:text-gray-300 transition-colors py-2">
            Features
          </a>
          <a href="#audio" className="block text-white hover:text-gray-300 transition-colors py-2">
            Audio
          </a>
          <a href="#model" className="block text-white hover:text-gray-300 transition-colors py-2">
            Model
          </a>
          <div className="pt-2 space-y-3">
            <Link 
              to="/login" 
              className="block text-white hover:text-gray-300 transition-colors py-2"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="block bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                px-4 py-2 rounded-full hover:opacity-90 transition-opacity text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 