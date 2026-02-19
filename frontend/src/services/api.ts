import { SessionResponse, ChatResponse, UserPrompt } from '@/types/agent';
import { errorLog } from '@/utils/log';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If we can't parse the error response, use the default message
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export const apiService = {
  /**
   * Create a new session with the backend
   */
  async createSession(): Promise<SessionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse<SessionResponse>(response);
    } catch (error) {
      errorLog('Failed to create session:', error);
      throw error;
    }
  },

  /**
   * Send a prompt to an existing session
   */
  async sendPrompt(sessionId: string, prompt: string): Promise<ChatResponse> {
    try {
      const body: UserPrompt = { prompt };

      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      return handleResponse<ChatResponse>(response);
    } catch (error) {
      errorLog('Failed to send prompt:', error);
      throw error;
    }
  },

  /**
   * Get session history
   */
  async getSessionHistory(sessionId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionId}/history`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return handleResponse(response);
    } catch (error) {
      errorLog('Failed to get session history:', error);
      throw error;
    }
  },

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return handleResponse(response);
    } catch (error) {
      errorLog('Failed to delete session:', error);
      throw error;
    }
  },
};

export { ApiError };
