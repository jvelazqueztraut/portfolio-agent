import { motion } from 'framer-motion';
import Loader from '@/components/Loader';

export default function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        zIndex: 'var(--z-loading)',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}
    >
      <motion.div 
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Loader />
        <motion.p 
          className="mt-4 text-lg"
          style={{ color: 'var(--foreground)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
