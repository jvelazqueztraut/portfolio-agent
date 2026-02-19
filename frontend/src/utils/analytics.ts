// Analytics provider abstraction layer
// This allows easy switching between analytics providers in the future
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendGAEvent } from '@next/third-parties/google';
import { analyticsLog } from './log';

/**
 * Analytics provider interface for abstraction
 */
export interface AnalyticsProvider {
  sendEvent: (eventName: string, params: Record<string, unknown>) => void;
}

/**
 * Google Analytics provider implementation
 */
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private checkGAReady(): Promise<void> {
    return new Promise(resolve => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check if dataLayer already exists
      if (typeof (window as any).dataLayer !== 'undefined') {
        resolve();
        return;
      }

      // Wait for dataLayer to be initialized (with timeout)
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait time

      const checkInterval = setInterval(() => {
        attempts++;
        if (typeof (window as any).dataLayer !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(); // Resolve anyway to avoid hanging
        }
      }, 100);
    });
  }

  sendEvent(eventName: string, params: Record<string, unknown>): void {
    if (typeof window === 'undefined') {
      // Server-side rendering: analytics should only run on client
      return;
    }

    // Wait for GA to be ready before sending events
    this.checkGAReady().then(() => {
      try {
        // Only send if dataLayer exists
        if (typeof (window as any).dataLayer !== 'undefined') {
          // Convert to Google Analytics format
          // sendGAEvent expects: (eventName, action, parameters)
          sendGAEvent('event', eventName, params);

          analyticsLog('Google Analytics', `Event: ${eventName}`, params);
        } else {
          analyticsLog(
            'Google Analytics',
            `GA not ready after wait, skipping event: ${eventName}`
          );
        }
      } catch (error) {
        console.error('Failed to send analytics event:', error);
      }
    });
  }
}

/**
 * No-op provider for testing or when analytics is disabled
 */
class NoOpAnalyticsProvider implements AnalyticsProvider {
  sendEvent(_eventName: string, _params: Record<string, unknown>): void {
    // No-op implementation
    analyticsLog(
      'Analytics',
      'Event skipped (no-op provider)',
      _eventName,
      _params
    );
  }
}

/**
 * Get the current analytics provider
 * This can be extended to support multiple providers or feature flags
 */
function getAnalyticsProvider(): AnalyticsProvider {
  // Check if Google Analytics is enabled
  if (process.env.NEXT_PUBLIC_GA_ID) {
    return new GoogleAnalyticsProvider();
  }

  // Return no-op provider if analytics is disabled
  return new NoOpAnalyticsProvider();
}

// Export singleton instance
export const analytics = getAnalyticsProvider();
