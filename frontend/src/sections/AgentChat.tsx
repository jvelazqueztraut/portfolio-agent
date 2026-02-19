// AgentChat section component for displaying agent speech and user choices

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Speech from '@/components/Speech';
import UserChoices from '@/components/UserChoices';
import { AgentOutput, UserChoice } from '@/types/agent';

interface AgentChatProps {
  agentOutput: AgentOutput | null;
  onChoiceSelect: (choice: UserChoice) => void;
  isLoading?: boolean;
}

export default function AgentChat({
  agentOutput,
  onChoiceSelect,
  isLoading = false,
}: AgentChatProps) {
  const [showUserChoices, setShowUserChoices] = useState(false);

  // Derive user choices from agent output
  const userChoices = useMemo(() => {
    if (!agentOutput) {
      return [];
    }
    if (!agentOutput.user_choices || agentOutput.user_choices.length === 0) {
      return [{ text: 'Continue' }];
    }
    return agentOutput.user_choices;
  }, [agentOutput]);

  // Reset showUserChoices when agentOutput changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowUserChoices(false);
  }, [agentOutput]);

  const handleSpeechFinished = () => {
    setShowUserChoices(true);
  };

  const variant = agentOutput?.phase === 'P8_Closing' ? 'closing' : 'default';

  if (!agentOutput) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-end md:items-center md:justify-end">
      {/* Container with responsive positioning */}
      <div
        className="flex flex-col px-4 pointer-events-auto
          w-full top-20 left-0 right-0 fixed md:relative md:top-auto md:left-auto md:right-auto
          md:w-[35%] md:mr-[5%]"
      >
        {/* Speech bubble - full width on mobile, normal on desktop */}
        <div className="w-full mb-6 md:mb-6">
          <AnimatePresence>
            <Speech
              text={agentOutput.readable_text}
              onSpeechFinished={handleSpeechFinished}
            />
          </AnimatePresence>
        </div>

        {/* User choices - fixed to bottom on mobile, inline on desktop */}
        <AnimatePresence>
          {userChoices.length > 0 && showUserChoices && (
            <div
              className="w-full
                fixed bottom-12 left-0 right-0 px-4 md:relative md:bottom-auto md:left-auto md:right-auto md:px-0"
            >
              <UserChoices
                choices={userChoices}
                onChoiceSelect={onChoiceSelect}
                disabled={isLoading}
                variant={variant}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
