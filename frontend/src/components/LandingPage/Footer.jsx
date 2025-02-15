import { motion } from "framer-motion";
import { Github, Twitter , Linkedin , Instagram , Facebook ,} from "lucide-react";
import Logo from "./Logo";

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
                <Github className="w-5 h-5" />
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
                <Instagram className="w-5 h-5" />
              </motion.a>   
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} vaani.pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;