// Type definitions for backend API models

export type Phase =
  | 'P1_Landing'
  | 'P2_Meet'
  | 'P3_WhoIsJavier'
  | 'P4_WhatIsImmersive'
  | 'P5_WhyItMatters'
  | 'P6_AI_Twist'
  | 'P7_Interact'
  | 'P8_Closing';

export type NextPhaseHint =
  | 'stay'
  | 'advance_on:user_choice'
  | 'advance_on:goal_met';

export interface UserChoice {
  text: string;
}

// Check the below correspond to the CharacterCommand type in the agent_models.py file
export interface CharacterCommand {
  type:
    | 'talking_normally'
    | 'talking_emphatically'
    | 'talking_excited'
    | 'greeting'
    | 'looking_around'
    | 'looking_behind';
}

// Check the below correspond to the CameraCommand type in the agent_models.py file
export interface CameraCommand {
  type:
    | 'enable_camera'
    | 'disable_camera'
    | 'default'
    | 'closeup'
    | 'wide_shot'
    | 'dolly_pulse'
    | 'orbit_left'
    | 'orbit_right'
    | 'orbit_360';
}

// Check the below correspond to the EnvironmentCommand type in the agent_models.py file
export interface EnvironmentCommand {
  type:
    | 'enable_background'
    | 'disable_background'
    | 'background_change_color'
    | 'enable_planets'
    | 'disable_planets'
    | 'planets_move_around'
    | 'enable_particle_effect'
    | 'disable_particle_effect'
    | 'particles_change_color';
}

// Check the below correspond to the SoundEffect type in the agent_models.py file
export interface SoundEffect {
  type: 'thinking' | 'excited' | 'congratulations';
}

// Check the below correspond to the AgentOutput type in the agent_models.py file
export interface AgentOutput {
  phase: Phase;
  readable_text: string;
  next_phase_hint: NextPhaseHint;
  user_choices: UserChoice[];
  character_command: CharacterCommand;
  camera_command: CameraCommand;
  environment_commands: EnvironmentCommand[];
  sound_effect: SoundEffect | null;
}

// API Response types
export interface SessionResponse {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  response: AgentOutput;
  session_id: string;
}

export interface SessionHistoryResponse {
  session_id: string;
  message_count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
}

// API Request types
export interface UserPrompt {
  prompt: string;
}
