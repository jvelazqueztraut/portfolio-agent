import { create } from 'zustand';
import { AgentOutput } from '@/types/agent';
import { apiService, ApiError } from '@/services/api';
import { debugLog, errorLog } from '@/utils/log';

interface AgentState {
  // State
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  agentOutput: AgentOutput | null;

  // Actions
  setSessionId: (sessionId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAgentOutput: (output: AgentOutput | null) => void;

  // Async actions
  initializeAgent: () => Promise<void>;
  sendMessage: (prompt: string) => Promise<void>;
  closeSession: () => Promise<void>;
  clearError: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Initial state
  sessionId: null,
  currentPhase: 'P1_Arrival',
  isLoading: false,
  error: null,
  agentOutput: null,

  // Synchronous actions
  setSessionId: sessionId => set({ sessionId }),
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error }),
  setAgentOutput: output => set({ agentOutput: output }),
  clearError: () => set({ error: null }),

  // Async actions
  initializeAgent: async () => {
    const { setLoading, setError, setSessionId } = get();

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.createSession();
      setSessionId(response.session_id);

      debugLog('Session initialized:', response.session_id);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Failed to initialize session';
      setError(errorMessage);
      errorLog('Session initialization failed:', error);
    } finally {
      setLoading(false);
    }
  },

  sendMessage: async (prompt: string) => {
    const { sessionId, setLoading, setError, setAgentOutput } = get();

    if (!sessionId) {
      setError('No active session. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.sendPrompt(sessionId, prompt);
      setAgentOutput(response.response);

      debugLog('Message sent successfully:', response.response);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to send message';
      setError(errorMessage);
      errorLog('Message sending failed:', error);
    } finally {
      setLoading(false);
    }
  },

  closeSession: async () => {
    const { sessionId, setLoading, setError, setSessionId } = get();

    if (!sessionId) {
      setError('No active session. Please refresh the page.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      await apiService.deleteSession(sessionId);
      setSessionId(null);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to close session';
      setError(errorMessage);
      errorLog('Session closing failed:', error);
    } finally {
      setLoading(false);
    }
  },
}));
