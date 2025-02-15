import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
      <div className="relative flex flex-col items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>
        <h3 className="text-xl font-display font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
          {title}
        </h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;