"""
Pydantic models and dependencies for the AI agent.
"""

from dataclasses import dataclass
from pydantic import BaseModel, constr, Field
from httpx import AsyncClient
from typing import Dict, Literal

# Length constraints constants
READABLE_TEXT_MIN_LENGTH = 1
READABLE_TEXT_MAX_LENGTH = 600
USER_CHOICE_TEXT_MAX_LENGTH = 200
USER_CHOICES_MAX_LENGTH = 4
ENVIRONMENT_COMMANDS_MAX_LENGTH = 3

@dataclass
class Deps:
    """Dependencies for the agent"""
    environment_commands_sent: set[str] | None = None  # Track environment commands sent in session

class UserChoice(BaseModel):
    """User choice model for agent to present to the user"""
    text: constr(strip_whitespace=True, max_length=USER_CHOICE_TEXT_MAX_LENGTH)

class CharacterCommand(BaseModel):
    """Character command model for agent to control the character in the 3D scene"""
    type: Literal[
        "talking_normally","talking_emphatically","talking_excited","greeting","looking_around","looking_behind"
    ]

class CameraCommand(BaseModel):
    """Camera command model for agent to control the camera in the 3D scene"""
    type: Literal[
        "enable_camera","disable_camera","default","closeup","wide_shot","dolly_pulse","orbit_left","orbit_right","orbit_360"
    ]

class EnvironmentCommand(BaseModel):
    """Environment command model for agent to control the environment"""
    type: Literal[
        "enable_background","disable_background","background_change_color","enable_planets","disable_planets","planets_move_around", "enable_particle_effect","disable_particle_effect","particles_change_color",
    ]

class SoundEffect(BaseModel):
    """Sound effect model for agent to play"""
    type: Literal[
        "thinking","excited","congratulations"
    ]

class AgentOutput(BaseModel):
    """Agent output model for agent to return to the user"""
    phase: Literal["P1_Arrival","P2_AboutJavier","P3_ProjectExplorer","P4_SystemThinking",
        "P5_InteractiveDemo","P6_Closing"]
    readable_text: constr(strip_whitespace=True, min_length=READABLE_TEXT_MIN_LENGTH, max_length=READABLE_TEXT_MAX_LENGTH)
    next_phase_hint: Literal["stay","advance_on:user_choice","advance_on:goal_met"]
    user_choices: list[UserChoice] = Field(max_length=USER_CHOICES_MAX_LENGTH)
    character_command: CharacterCommand
    camera_command: CameraCommand
    environment_commands: list[EnvironmentCommand] = Field(max_length=ENVIRONMENT_COMMANDS_MAX_LENGTH)
    sound_effect: SoundEffect | None = None

Output = AgentOutput
