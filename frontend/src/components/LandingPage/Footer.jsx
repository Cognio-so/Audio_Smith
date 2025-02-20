import { motion } from "framer-motion";
import {  Twitter , Linkedin , Youtube } from "lucide-react";
import Logo from "./Logo";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-20 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-400">
              Transform your voice into intelligent actions with our AI-powered assistant.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Voice Chat</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Image Generation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Research</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="text-gray-400 hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold mb-4">Connect with us</h4>
            <div className="flex gap-2">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </motion.a>
              
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} vaani.pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;