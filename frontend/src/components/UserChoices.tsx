// UserChoices component for displaying agent choices as interactive buttons

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserChoice } from '@/types/agent';
import ChoiceButton from '@/components/ChoiceButton';

interface UserChoicesProps {
  choices: UserChoice[];
  onChoiceSelect: (choice: UserChoice) => void;
  disabled?: boolean;
  variant?: 'default' | 'closing';
}

export default function UserChoices({
  choices,
  onChoiceSelect,
  disabled = false,
  variant = 'default',
}: UserChoicesProps) {
  const [selectedChoice, setSelectedChoice] = useState<UserChoice | null>(null);

  // Handle delayed visibility of title
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedChoice(null);
  }, [choices]);

  if (choices.length === 0) {
    return null;
  }

  const handleChoiceSelect = (choice: UserChoice) => {
    setSelectedChoice(choice);
    onChoiceSelect(choice);
  };

  // Create a unique key based on choices to force re-animation
  const choicesKey = choices.map(c => c.text).join('|');

  return (
    <motion.div
      key={choicesKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col space-y-2 items-end"
    >
      <motion.div
        className="flex flex-col gap-3 w-full items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {choices.map((choice, index) => (
          <ChoiceButton
            key={`${choice.text}-${index}`}
            choice={choice}
            onSelect={handleChoiceSelect}
            disabled={
              disabled || (selectedChoice !== null && selectedChoice !== choice)
            }
            index={index}
            isSelected={selectedChoice === choice}
            variant={variant}
          />
        ))}
      </motion.div>

      {variant === 'default' && (
        <motion.h4
          className="text-xs font-light text-white/80 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          CHOOSE YOUR RESPONSE
        </motion.h4>
      )}
    </motion.div>
  );
}
