import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Features from "../components/LandingPage/Feature";
import Hero from "../components/LandingPage/Hero";
import AudioTransformation from "../components/LandingPage/AudioTransformation";
import Model from "../components/LandingPage/Model";
import ModelsName from "../components/LandingPage/ModelsName";
import Footer from "../components/LandingPage/Footer";
import Navbar from "../components/Navbar/Navbar";

const HeroPage = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#090909] text-white"
    >
      <Navbar />
      <Hero />
      <Features />
      <AudioTransformation />
      <Model />
      <ModelsName />
      <Footer />
    </motion.div>
  );
};

export default HeroPage;