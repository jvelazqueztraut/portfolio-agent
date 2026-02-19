import { motion, Variant } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

type StreamingTextProps = {
  text: string | string[];
  el?: keyof React.JSX.IntrinsicElements;
  className?: string;
  once?: boolean;
  repeatDelay?: number;
  animation?: {
    hidden: Variant;
    visible: Variant;
  };
  onFinishAnimation?: () => void;
};

const defaultAnimations = {
  hidden: {
    opacity: 0,
    y: -1,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const StreamingText = ({
  text,
  el: Wrapper = 'p',
  className,
  animation = defaultAnimations,
  onFinishAnimation,
}: StreamingTextProps) => {
  const allWords = useMemo(() => {
    const textArray = Array.isArray(text) ? text : [text];
    return textArray.flatMap(line => line.split(' '));
  }, [text]);
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [showCaret, setShowCaret] = useState(true);

  useEffect(() => {
    // Reset when text changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleWordCount(0);
    setShowCaret(true);

    if (allWords.length === 0) {
      setShowCaret(false);
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    let currentDelay = 0;

    allWords.forEach((word, index) => {
      // Check if the previous word ended a sentence
      const prevWord = index > 0 ? allWords[index - 1] : '';
      const endsSentence = /[.!?]$/.test(prevWord);

      // Add extra delay after sentence endings
      if (endsSentence) {
        currentDelay += 1000;
      }

      const isLastWord = index === allWords.length - 1;

      const timeout = setTimeout(() => {
        setVisibleWordCount(prev => prev + 1);

        // Hide caret after last word appears (plus animation duration)
        if (isLastWord) {
          setTimeout(() => {
            setShowCaret(false);
          }, 500); // Wait for animation to complete
        }
      }, currentDelay);

      timeouts.push(timeout);

      // Add base delay between words
      currentDelay += 100;
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [allWords]);

  const visibleWords = allWords
    .slice(0, visibleWordCount)
    .map((word, index) => {
      return (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block mr-1"
          variants={animation}
          initial="hidden"
          animate="visible"
        >
          {word}
        </motion.span>
      );
    });

  useEffect(() => {
    if (allWords.length > 0 && visibleWordCount === allWords.length) {
      onFinishAnimation?.();
    }
  }, [visibleWordCount, allWords.length, onFinishAnimation]);

  const textArray = Array.isArray(text) ? text : [text];

  return React.createElement(
    Wrapper,
    { className },
    <>
      <span className="sr-only">{textArray.join(' ')}</span>
      <motion.span aria-hidden>
        <span className="block">
          {visibleWords}
          {/* Caret shows while streaming and hides when done */}
          {showCaret && visibleWordCount < allWords.length && (
            <motion.span
              key="caret"
              aria-hidden
              className="inline-block w-[0.6ch] align-baseline"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, repeat: Infinity }}
            >
              ▊
            </motion.span>
          )}
        </span>
      </motion.span>
    </>
  );
};

export default StreamingText;
