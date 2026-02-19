// CTA Button component with modern space-themed styling

import React from 'react';
import { motion } from 'framer-motion';

interface CTAButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function CTAButton({
  onClick,
  disabled = false,
  children,
  className = '',
  isLoading = false,
}: CTAButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
      whileHover={
        !isDisabled
          ? {
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={
        !isDisabled
          ? {
              scale: 0.95,
              transition: { duration: 0.1 },
            }
          : {}
      }
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative px-8 py-4 text-lg font-semibold text-white
        bg-gradient-to-r from-blue-600 to-purple-600
        border border-blue-400/30 rounded-lg
        shadow-lg shadow-blue-500/25
        transition-all duration-300 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:border-gray-500/30
        disabled:hover:shadow-lg disabled:hover:shadow-gray-500/25
        backdrop-blur-sm
        ${className}
      `}
    >
      {/* Animated background gradient */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      )}

      {/* Button content */}
      <motion.span
        className={`relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>

      {/* Glow effect */}
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 to-purple-400/10"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}
