import { motion } from "framer-motion";
import { FileText, Image, Mail, MessageSquare } from "lucide-react";

const AudioTransform = () => {
  const transformItems = [
    { icon: FileText, label: "PDF Report" },
    { icon: Image, label: "Image" },
    { icon: MessageSquare, label: "Chat Response" },
    { icon: Mail, label: "Email" },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5" />
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Transform Voice into Anything
          </h2>
          <p className="text-xl text-gray-400">Your voice commands, our AI magic</p>
        </motion.div>

        <div className="relative">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 0 0 rgba(121, 40, 202, 0)",
                "0 0 0 20px rgba(121, 40, 202, 0.2)",
                "0 0 0 0 rgba(121, 40, 202, 0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-16"
          >
            <span className="text-2xl font-bold text-white">
              <img src="/vannipro.png" alt="Vanni Pro" className="w-14 h-14" />
            </span>
          </motion.div>

          <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
            {transformItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center"
                >
                  <item.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <span className="text-gray-400">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioTransform;