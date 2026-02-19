import uuid
import asyncio
import os
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from contextlib import asynccontextmanager
import logfire
from pydantic_ai import Agent, ModelSettings
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider

from agent_config import agent_config, configure_agent, Deps, Output


class SessionData:
    """Data structure for storing session information"""
    def __init__(self, session_id: str, agent: Agent, created_at: datetime):
        self.session_id = session_id
        self.agent = agent
        self.created_at = created_at
        self.last_accessed = created_at
        self.message_history: List = []  # Store message history for this session
        self.environment_commands_sent: set[str] = set()  # Track environment commands sent in this session


class SessionManager:
    """Manages agent sessions in memory"""
    def __init__(self, timeout_minutes: int = 30, enable_cleanup: bool = True):
        self.sessions: Dict[str, SessionData] = {}
        self.timeout_minutes = timeout_minutes
        self._cleanup_task = None
        self.enable_cleanup = enable_cleanup
    
    def create_session(self) -> str:
        """Create a new agent session and return session ID"""
        session_id = str(uuid.uuid4())
        
        # Create new agent instance for this session
        provider = GoogleProvider(api_key=agent_config.model_provider_api_key)
        model = GoogleModel(agent_config.model_name, provider=provider)
        agent = Agent(model=model, deps_type=Deps, output_type=Output, model_settings=ModelSettings(temperature=agent_config.temperature))
        configure_agent(agent)
        
        # Store session data
        self.sessions[session_id] = SessionData(
            session_id=session_id,
            agent=agent,
            created_at=datetime.now()
        )
        
        logfire.info('Created new session: {session_id}', session_id=session_id)
        return session_id
    
    def get_session(self, session_id: str) -> Optional[SessionData]:
        """Get session data and update last accessed time"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        session.last_accessed = datetime.now()
        return session
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logfire.info('Deleted session: {session_id}', session_id=session_id)
            return True
        return False
    
    def clear_session_history(self, session_id: str) -> bool:
        """Clear message history for a session"""
        if session_id in self.sessions:
            self.sessions[session_id].message_history.clear()
            self.sessions[session_id].environment_commands_sent.clear()
            logfire.info('Cleared message history for session: {session_id}', session_id=session_id)
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Remove sessions that have exceeded the timeout"""
        now = datetime.now()
        expired_sessions = []
        
        for session_id, session_data in self.sessions.items():
            time_since_access = now - session_data.last_accessed
            if time_since_access > timedelta(minutes=self.timeout_minutes):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.sessions[session_id]
            logfire.info('Cleaned up expired session: {session_id}', session_id=session_id)
    
    @asynccontextmanager
    async def cleanup_task_context(self):
        """Context manager for the cleanup task"""
        async def cleanup_loop():
            while True:
                try:
                    self.cleanup_expired_sessions()
                    await asyncio.sleep(60)  # Check every minute
                except asyncio.CancelledError:
                    logfire.info('Cleanup task cancelled')
                    raise
                except Exception as e:
                    logfire.error('Error in cleanup task: {error}', error=str(e))
                    await asyncio.sleep(60)
        
        self._cleanup_task = asyncio.create_task(cleanup_loop())
        logfire.info('Started session cleanup task')
        
        try:
            yield
        finally:
            if self._cleanup_task and not self._cleanup_task.done():
                self._cleanup_task.cancel()
                try:
                    await self._cleanup_task
                except asyncio.CancelledError:
                    logfire.info('Cleanup task stopped')
                except Exception as e:
                    logfire.error('Error stopping cleanup task: {error}', error=str(e))
    
    async def start_cleanup_task(self):
        """Start background task to clean up expired sessions (backward compatibility)"""
        # Don't start if cleanup is disabled or already running
        if not self.enable_cleanup:
            logfire.info('Cleanup task disabled')
            return
        
        if self._cleanup_task is not None and not self._cleanup_task.done():
            return
        
        async def cleanup_loop():
            while True:
                try:
                    self.cleanup_expired_sessions()
                    await asyncio.sleep(60)  # Check every minute
                except asyncio.CancelledError:
                    logfire.info('Cleanup task cancelled')
                    raise
                except Exception as e:
                    logfire.error('Error in cleanup task: {error}', error=str(e))
                    await asyncio.sleep(60)
        
        self._cleanup_task = asyncio.create_task(cleanup_loop())
        logfire.info('Started session cleanup task')
    
    async def stop_cleanup_task(self):
        """Stop the background cleanup task (backward compatibility)"""
        if not self.enable_cleanup:
            return
        
        if self._cleanup_task and not self._cleanup_task.done():
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                logfire.info('Cleanup task stopped')
            except Exception as e:
                logfire.error('Error stopping cleanup task: {error}', error=str(e))


# Global session manager instance
# Disable cleanup task in serverless environments (Vercel) to avoid event loop issues
_is_vercel = os.getenv("VERCEL") is not None
session_manager = SessionManager(enable_cleanup=not _is_vercel)
