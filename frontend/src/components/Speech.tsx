// AgentSpeech component for displaying agent's readable text

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StreamingText from './StreamingText';

interface SpeechProps {
  text: string;
  className?: string;
  onSpeechFinished?: () => void;
}

export default function Speech({
  text,
  className = '',
  onSpeechFinished,
}: SpeechProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
        className={`p-6 backdrop-blur-sm rounded-lg ${className}`}
        style={{ backgroundColor: 'var(--background-light-80)' }}
      >
        <StreamingText
          text={text}
          className="text-base leading-relaxed font-medium text-[var(--text-light)]"
          onFinishAnimation={onSpeechFinished}
        />
      </motion.div>
    </AnimatePresence>
  );
}
