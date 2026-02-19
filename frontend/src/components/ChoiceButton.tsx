// ChoiceButton component for individual choice buttons

import React from 'react';
import { motion } from 'framer-motion';
import { UserChoice } from '@/types/agent';

interface ChoiceButtonProps {
  choice: UserChoice;
  onSelect: (choice: UserChoice) => void;
  disabled?: boolean;
  index?: number;
  isSelected?: boolean;
  variant?: 'default' | 'closing';
}

export default function ChoiceButton({
  choice,
  onSelect,
  disabled = false,
  index = 0,
  isSelected = false,
  variant = 'default',
}: ChoiceButtonProps) {
  const isGrayedOut = disabled && !isSelected;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: isGrayedOut
          ? 'grayscale(0.8) brightness(0.6)'
          : 'grayscale(0) brightness(1)',
      }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      whileHover={{
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: disabled ? 1 : 0.95,
        transition: { duration: 0.1 },
      }}
      onClick={() => !disabled && onSelect(choice)}
      disabled={disabled}
      className={`
        px-6 py-3 ${variant === 'closing' ? 'text-lg' : 'text-sm'} font-bold ${variant === 'closing' ? 'text-white' : 'text-[var(--choice-text-dark)]'}
        ${
          isSelected
            ? 'bg-[var(--choice-bg-selected)]'
            : variant === 'closing'
              ? 'bg-[var(--choice-bg-closing)]'
              : 'bg-[var(--choice-bg-default)]'
        }
        rounded-full
        transition-all duration-300 ease-out
        disabled:cursor-not-allowed disabled:transform-none
        min-w-[120px]
        ${isGrayedOut ? 'opacity-80' : 'opacity-100'}
      `}
    >
      {choice.text}
    </motion.button>
  );
}
