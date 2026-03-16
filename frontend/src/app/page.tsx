'use client';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/sections/LoadingScreen';
import ThreeScene, { ThreeSceneRef } from '@/sections/ThreeScene';
import AgentChat from '@/sections/AgentChat';
import CTAButton from '@/components/CTAButton';
import { useAgentStore } from '@/store/useAgentStore';
import { errorLog } from '@/utils/log';
import { AgentOutput, UserChoice } from '@/types/agent';
import { useURLParams } from '@/contexts/URLParamsContext';
import URLParamsReader from '@/components/URLParamsReader';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function LandingPage() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const { showControls, setShowControls } = useURLParams();
  const [userName, setUserName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const threeSceneRef = useRef<ThreeSceneRef>(null);

  const {
    sessionId,
    isLoading,
    error,
    agentOutput,
    initializeAgent,
    sendMessage,
    clearError,
  } = useAgentStore();
  const hasAttemptedInitRef = useRef(false);
  const lastAgentOutputRef = useRef<AgentOutput | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Initialize session once the initial loading is done
    // Only attempt once to prevent infinite retry loops
    if (!sessionId && !isLoading && !hasAttemptedInitRef.current) {
      hasAttemptedInitRef.current = true;
      initializeAgent();
    }

    // TODO: Close session when the component unmounts
  }, [sessionId, isLoading, initializeAgent, trackEvent]);

  const handleThreeSceneProgress = (progress: number) => {
    if (progress === 100) {
      setTimeout(() => {
        setShowLoadingScreen(false);
      }, 1000); // one extra second to ensure 3D scene is ready
    }
  };
  useEffect(() => {
    if (agentOutput) {
      trackEvent('agent_output', {
        current_phase: agentOutput.phase,
        next_phase_hint: agentOutput.next_phase_hint,
        session_id: sessionId || undefined,
      });
      lastAgentOutputRef.current = agentOutput;
    }
  }, [agentOutput, sessionId, trackEvent]);

  useEffect(() => {
    if (error) {
      trackEvent('agent_error', {
        error: error,
        session_id: sessionId || undefined,
      });
    }
  }, [sessionId, error, trackEvent]);

  const talkingTime = useMemo(() => {
    return Math.max((agentOutput?.readable_text?.length ?? 0) * 0.05, 2);
  }, [agentOutput]);

  const handleCTAClick = useCallback(async () => {
    if (!sessionId) {
      errorLog('No session available');
      return;
    }

    setHasStarted(true);
    trackEvent('experience_start', {
      user_name: userName.trim(),
      session_id: sessionId,
    });

    // Send a specific prompt to start the experience with the user's name
    // TODO: Parse name from input better to avoid name injection attacks
    await sendMessage(`Start the experience. My name is ${userName.trim()}.`);
  }, [sessionId, sendMessage, userName, trackEvent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const isButtonEnabled =
          sessionId && !isLoading && userName.trim() && !hasStarted;
        if (isButtonEnabled) {
          handleCTAClick();
        }
      }
    },
    [sessionId, isLoading, userName, hasStarted, handleCTAClick]
  );

  const handleChoiceSelect = useCallback(
    async (choice: UserChoice) => {
      if (!sessionId) {
        errorLog('No session available');
        return;
      }

      if (agentOutput?.phase === 'P6_Closing') {
        if (choice.text.includes('velazqueztraut.com')) {
          trackEvent('close_link', {
            choice_text: choice.text,
            link_url: 'https://www.velazqueztraut.com',
            session_id: sessionId,
          });
          window.location.href = 'https://www.velazqueztraut.com';
        } else if (choice.text === 'Restart') {
          trackEvent('close_restart', {
            choice_text: choice.text,
            session_id: sessionId,
          });
          window.location.reload();
        }
        return;
      }

      // Track user choice event
      trackEvent('user_choice', {
        choice_text: choice.text,
        current_phase: agentOutput?.phase,
        session_id: sessionId,
      });

      // Send the selected choice as a message to the agent
      await sendMessage(choice.text);
    },
    [sessionId, sendMessage, agentOutput, trackEvent]
  );

  return (
    <div className="relative min-h-screen">
      <Suspense fallback={null}>
        <URLParamsReader onUpdate={setShowControls} />
      </Suspense>
      <AnimatePresence>
        {showLoadingScreen && <LoadingScreen />}
      </AnimatePresence>
      {/* Name Input and CTA Button - positioned at top when no agent output */}
      <AnimatePresence>
        {!agentOutput && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="fixed top-20 left-0 right-0 z-20 pointer-events-auto"
          >
            <div className="flex flex-col items-center space-y-4 px-4">
              <motion.input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name"
                disabled={hasStarted}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full max-w-md px-4 py-3 text-lg bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CTAButton
                  onClick={handleCTAClick}
                  disabled={
                    !sessionId || isLoading || !userName.trim() || hasStarted
                  }
                  isLoading={isLoading}
                >
                  {isLoading ? 'Starting...' : 'Start Experience'}
                </CTAButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-30 pointer-events-auto px-4"
          >
            <div className="text-center">
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 inline-block">
                <p className="text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs underline hover:text-red-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Chat - speech and user choices */}
      <AgentChat
        agentOutput={agentOutput}
        onChoiceSelect={handleChoiceSelect}
        isLoading={isLoading}
      />

      {/* Current Phase Display - bottom right corner */}
      {process.env.NEXT_PUBLIC_IS_DEV === 'true' && (
        <AnimatePresence>
          {agentOutput && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-4 right-4 z-10 pointer-events-none"
            >
              <div className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                {agentOutput.phase.split('_')[0]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      <ThreeScene
        ref={threeSceneRef}
        talkingTime={talkingTime}
        characterCommand={agentOutput?.character_command ?? null}
        cameraCommand={agentOutput?.camera_command ?? null}
        environmentCommand={agentOutput?.environment_commands ?? null}
        showControls={showControls}
        onProgress={handleThreeSceneProgress}
      />
    </div>
  );
}
