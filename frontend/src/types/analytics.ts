// Analytics event type definitions
/**
 * Base event parameters that all custom events should include
 */
export interface BaseEventParams {
  session_id?: string;
}

/**
 * Specific event parameter types
 */
export interface ExperienceStartEventParams extends BaseEventParams {
  user_name?: string;
}

export interface AgentOutputEventParams extends BaseEventParams {
  current_phase: string;
  next_phase_hint: string;
}

export interface UserChoiceEventParams extends BaseEventParams {
  choice_text: string;
  current_phase?: string;
}

export interface CloseRestartEventParams extends BaseEventParams {
  choice_text: string;
}

export interface CloseLinkEventParams extends BaseEventParams {
  choice_text: string;
  link_url: string;
}

export interface AgentErrorEventParams extends BaseEventParams {
  error: string;
}

/**
 * Union of all possible event parameters
 */
export type AnalyticsEventParams =
  | ExperienceStartEventParams
  | AgentOutputEventParams
  | UserChoiceEventParams
  | CloseRestartEventParams
  | CloseLinkEventParams
  | AgentErrorEventParams
  | BaseEventParams;

/**
 * Typed event names
 */
export type AnalyticsEventName =
  | 'experience_start'
  | 'agent_output'
  | 'user_choice'
  | 'close_restart'
  | 'close_link'
  | 'agent_error';

/**
 * Event map to ensure type safety between event names and their parameters
 */
export interface AnalyticsEventMap {
  experience_start: ExperienceStartEventParams;
  agent_output: AgentOutputEventParams;
  user_choice: UserChoiceEventParams;
  close_restart: CloseRestartEventParams;
  close_link: CloseLinkEventParams;
  agent_error: AgentErrorEventParams;
}
