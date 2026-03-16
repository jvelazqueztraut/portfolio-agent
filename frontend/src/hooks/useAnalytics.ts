'use client';

import { useCallback } from 'react';
import { analytics } from '@/utils/analytics';
import {
  AnalyticsEventName,
  AnalyticsEventMap,
  AnalyticsEventParams,
} from '@/types/analytics';

/**
 * Typed analytics hook that provides type-safe event tracking
 *
 * @example
 * ```tsx
 * const { trackEvent } = useAnalytics();
 *
 * // Type-safe event tracking
 * trackEvent('user_choice', {
 *   choice_text: 'Continue',
 *   current_phase: 'P1_Arrival'
 * });
 * ```
 */
export function useAnalytics() {
  /**
   * Track an analytics event with type safety
   *
   * @param eventName - The name of the event (must match AnalyticsEventName)
   * @param params - Event parameters matching the event name's type
   */
  const trackEvent = useCallback(
    <T extends AnalyticsEventName>(
      eventName: T,
      params: AnalyticsEventMap[T]
    ) => {
      analytics.sendEvent(eventName, params as Record<string, unknown>);
    },
    []
  );

  /**
   * Track a custom event (for flexibility when needed)
   * Use with caution - prefer typed events when possible
   */
  const trackCustomEvent = useCallback(
    (eventName: string, params: AnalyticsEventParams = {}) => {
      analytics.sendEvent(eventName, params as Record<string, unknown>);
    },
    []
  );

  return {
    trackEvent,
    trackCustomEvent,
  };
}
