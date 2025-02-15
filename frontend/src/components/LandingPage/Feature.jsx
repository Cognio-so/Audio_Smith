import { motion } from "framer-motion";
import { MessageSquare, Search, BarChart, Image, FileText, Music, Wand2 } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Models",
    description: "Engage with cutting-edge AI models through natural voice conversations",
  },
  {
    icon: Search,
    title: "Deep Research",
    description: "Get comprehensive research reports from multiple sources with voice commands",
  },
  {
    icon: BarChart,
    title: "Financial Analysis",
    description: "Receive detailed stock analysis and recommendations through voice queries",
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning images with simple voice descriptions",
  },
  {
    icon: FileText,
    title: "Document Q&A",
    description: "Ask questions about any PDF or document and get instant answers",
  },
  {
    icon: Music,
    title: "Music Generation",
    description: "Generate unique music compositions with voice instructions",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
            Everything You Need, Just a Voice Command Away
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the power of voice-controlled AI assistance
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-3xl -z-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;