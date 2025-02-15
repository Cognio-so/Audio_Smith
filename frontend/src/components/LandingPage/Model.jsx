import { motion } from "framer-motion";
import { Cpu, Sparkles } from "lucide-react";

const Models = () => {
  const modelCards = [
    {
      name: "GPT-4",
      description: "Latest and most advanced language model",
      features: ["Voice Chat", "Complex Tasks", "Creative Writing"],
    },
    {
      name: "DALL-E 3",
      description: "State-of-the-art image generation",
      features: ["Image Creation", "Art Styles", "Visual Edits"],
    },
    {
      name: "Whisper",
      description: "Advanced speech recognition",
      features: ["Multilingual", "High Accuracy", "Real-time"],
    },
  ];

  return (
    <section className="py-32 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Powered by Advanced AI Models
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Access cutting-edge AI models through simple voice commands
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modelCards.map((model, index) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              <div className="relative">
                <h3 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  {model.name}
                  <motion.div
                    animate={{ 
                      rotate: [0, 180, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                  </motion.div>
                </h3>
                <p className="text-gray-400 mb-6">{model.description}</p>
                <ul className="space-y-2">
                  {model.features.map((feature) => (
                    <motion.li 
                      key={feature} 
                      className="text-gray-500 flex items-center gap-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        whileHover={{ scale: 1.5 }}
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Models;