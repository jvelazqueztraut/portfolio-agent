import os
from dataclasses import dataclass
from dotenv import load_dotenv
import logfire
from pydantic_ai import Agent, RunContext
from typing import Dict
from agent_models import CameraCommand, CharacterCommand, EnvironmentCommand, Deps, Output, ENVIRONMENT_COMMANDS_MAX_LENGTH, UserChoice
from agent_system_prompt import get_system_prompt

# Load environment variables
load_dotenv()

@dataclass
class AgentConfig:
    """Configuration for the AI agent"""
    model_name: str = 'gemini-2.5-flash'
    model_provider_api_key: str = os.getenv('GOOGLE_API_KEY')
    temperature: float = 0.3

# Create global agent configuration instance
agent_config = AgentConfig()

# Agent definition functions
# TODO: Add style examples to system prompt
def setup_agent_system_prompt(agent: Agent) -> None:
    """Set up the system prompt for the agent"""
    @agent.system_prompt
    def system_prompt(context: RunContext) -> str:
        return get_system_prompt()

# def setup_agent_tools(agent: Agent) -> None:
#     """Set up the tools for the agent"""
#     @agent.tool
#     async def call_tool(ctx: RunContext, tool_name: str, params: dict) -> Dict[str, any]:
#         """Call the agent tool with the given name and parameters
#         Args:
#             ctx: The run context with the dependencies
#             tool_name: The name of the tool to call
#             params: The parameters to pass to the tool
#         """
#         if not ctx.deps.tool_api_key:
#             raise ValueError("Tool API key is not set")
        
#         params = {
#             'q': location_description,
#             'api_key': ctx.deps.tool_api_key,
#         }
#         with logfire.span('Calling tool API', params=params) as span:
#             res = await ctx.deps.client.get(agent_config.tool_api_url, params=params)
#             res.raise_for_status()
#             data = res.json()
#             span.set_attribute('response_data', data)
#             return {'data': data}

def setup_agent_output_validator(agent: Agent) -> None:
    """Set up the output validator for the agent"""
    @agent.output_validator
    async def output_validator(ctx: RunContext, output) -> object:
        """Validate the agent output"""
        # If the phase is P1_Landing, then CharacterCommand should be greeting
        if output.phase == 'P1_Landing':
            output.character_command = CharacterCommand(type='greeting')
        # If the phase is P1_Landing, then CameraCommand should be enable_camera
        if output.phase == 'P1_Landing':
            output.camera_command = CameraCommand(type='enable_camera')
        # If the phase is P8_Closing, then CameraCommand should be disable_camera
        # Background and planets should be disabled before closing
        elif output.phase == 'P8_Closing':
            output.camera_command = CameraCommand(type='disable_camera')
            output.environment_commands = []
            output.environment_commands.append(EnvironmentCommand(type='disable_background'))
            output.environment_commands.append(EnvironmentCommand(type='disable_planets'))
            output.environment_commands.append(EnvironmentCommand(type='disable_particle_effect'))
            output.user_choices = [UserChoice(text='Visit velazqueztraut.com'), UserChoice(text='Restart')]
        # Correct output by adding missing environment commands based on session history
        if ctx.deps.environment_commands_sent is not None:
            # Get commands already in this output
            current_env_commands = {env_cmd.type for env_cmd in output.environment_commands}
            
            # Check if enable_background should be added before P4_WhatIsImmersive
            if output.phase == 'P4_WhatIsImmersive':
                if 'enable_background' not in ctx.deps.environment_commands_sent and 'enable_background' not in current_env_commands:
                    if len(output.environment_commands) < ENVIRONMENT_COMMANDS_MAX_LENGTH:
                        output.environment_commands.append(EnvironmentCommand(type='enable_background'))
            
            # Check if enable_particle_effect should be added before P7_Interact
            if output.phase == 'P7_Interact':
                if 'enable_particle_effect' not in ctx.deps.environment_commands_sent and 'enable_particle_effect' not in current_env_commands:
                    if len(output.environment_commands) < ENVIRONMENT_COMMANDS_MAX_LENGTH:
                        output.environment_commands.append(EnvironmentCommand(type='enable_particle_effect'))
            # Check if enable_planets should be added before P7_Interact
            if output.phase == 'P7_Interact':
                if 'enable_planets' not in ctx.deps.environment_commands_sent and 'enable_planets' not in current_env_commands:
                    if len(output.environment_commands) < ENVIRONMENT_COMMANDS_MAX_LENGTH:
                        output.environment_commands.append(EnvironmentCommand(type='enable_planets'))
        
        return output

def configure_agent(agent: Agent) -> None:
    """Configure the agent with all its components"""
    setup_agent_system_prompt(agent)
    # setup_agent_tools(agent)
    setup_agent_output_validator(agent)
