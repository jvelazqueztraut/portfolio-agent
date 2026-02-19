import logfire
import os
from httpx import AsyncClient
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import List, Any
from contextlib import asynccontextmanager

from agent_config import Deps, Output
from server_config import server_config
from session_manager import session_manager

def scrubbing_callback(m: logfire.ScrubMatch):
    if m.path == ('attributes', 'session_id'):
        return m.value

logfire.configure(scrubbing=logfire.ScrubbingOptions(callback=scrubbing_callback))

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await session_manager.start_cleanup_task()
    yield
    # Shutdown
    await session_manager.stop_cleanup_task()

# FastAPI instance with lifespan
app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=server_config.cors_origins,
  allow_credentials=True,
  allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allow_headers=["*"],
  expose_headers=["*"],
)

# Pydantic models for API requests/responses
class UserPrompt(BaseModel):
    prompt: str

class SessionResponse(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: Output
    session_id: str

class SessionHistoryResponse(BaseModel):
    session_id: str
    message_count: int
    messages: List[Any]

# Health check endpoint
@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Portfolio Agent Backend is running"}

# Debug endpoint to check CORS configuration
@app.get("/debug/cors")
async def debug_cors():
    """Debug endpoint to check CORS configuration"""
    return {
        "cors_origins": server_config.cors_origins,
        "environment": {
            "FRONTEND_URL": os.getenv("FRONTEND_URL"),
        }
    }

# New session-based endpoints
@app.options("/api/sessions")
async def options_sessions():
    """Handle OPTIONS preflight request for sessions endpoint"""
    return {"message": "OK"}

@app.options("/api/sessions/{session_id}/chat")
async def options_chat(session_id: str):
    """Handle OPTIONS preflight request for chat endpoint"""
    return {"message": "OK"}

@app.post("/api/sessions", response_model=SessionResponse)
async def create_session():
    """Initialize a new agent session"""
    try:
        session_id = session_manager.create_session()
        return SessionResponse(
            session_id=session_id,
            message="Session created successfully"
        )
    except Exception as e:
        logfire.error('Failed to create session: {error}', error=str(e))
        raise HTTPException(status_code=500, detail="Failed to create session")

@app.post("/api/sessions/{session_id}/chat", response_model=ChatResponse)
async def chat_with_session(session_id: str, body: UserPrompt):
    """Send a prompt to an existing session"""
    # Get session data
    session_data = session_manager.get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if session has expired
    now = datetime.now()
    time_since_access = now - session_data.last_accessed
    if time_since_access > timedelta(minutes=session_manager.timeout_minutes):
        session_manager.delete_session(session_id)
        raise HTTPException(status_code=410, detail="Session has expired")
    
    try:
        async with AsyncClient() as client:
            deps = Deps(
                environment_commands_sent=session_data.environment_commands_sent
            )
            
            # Run agent with message history to maintain context
            res = await session_data.agent.run(body.prompt, deps=deps, message_history=session_data.message_history)
            
            # Update message history with new messages from this interaction
            session_data.message_history.extend(res.new_messages())
            
            # Track environment commands sent in this session
            for env_cmd in res.output.environment_commands:
                session_data.environment_commands_sent.add(env_cmd.type)
            
            logfire.info('Agent response for session {session_id}: {res}', 
                        session_id=session_id, res=res.output)
            
            return ChatResponse(
                response=res.output,
                session_id=session_id
            )
    except Exception as e:
        logfire.error('Error processing prompt for session {session_id}: {error}', 
                     session_id=session_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to process prompt")

@app.get("/api/sessions/{session_id}/history", response_model=SessionHistoryResponse)
async def get_session_history(session_id: str):
    """Get the message history for a session"""
    session_data = session_manager.get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    logfire.info('Retrieving message history for session {session_id} with {count} messages', 
                session_id=session_id, count=len(session_data.message_history))
    
    # Convert message objects to dictionaries for JSON serialization
    messages = []
    for msg in session_data.message_history:
        try:
            # Try different serialization methods for pydantic_ai message objects
            if hasattr(msg, 'model_dump'):
                messages.append(msg.model_dump())
            elif hasattr(msg, 'dict'):
                messages.append(msg.dict())
            elif hasattr(msg, '__dict__'):
                # For objects with __dict__, convert to dict and handle any non-serializable values
                msg_dict = {}
                for key, value in msg.__dict__.items():
                    try:
                        # Try to serialize the value
                        if hasattr(value, 'model_dump'):
                            msg_dict[key] = value.model_dump()
                        elif hasattr(value, 'dict'):
                            msg_dict[key] = value.dict()
                        elif isinstance(value, (str, int, float, bool, list, dict, type(None))):
                            msg_dict[key] = value
                        else:
                            msg_dict[key] = str(value)
                    except Exception:
                        msg_dict[key] = str(value)
                messages.append(msg_dict)
            else:
                # Fallback to string representation
                messages.append({"content": str(msg), "type": "unknown"})
        except Exception as e:
            # If all else fails, create a safe representation
            messages.append({"content": str(msg), "type": "error", "error": str(e)})
    
    return SessionHistoryResponse(
        session_id=session_id,
        message_count=len(session_data.message_history),
        messages=messages
    )

@app.delete("/api/sessions/{session_id}/history")
async def clear_session_history(session_id: str):
    """Clear the message history for a session"""
    success = session_manager.clear_session_history(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session history cleared successfully"}

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete an agent session"""
    success = session_manager.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}


if __name__ == "__main__":
  uvicorn.run("main:app", reload=server_config.reload, host=server_config.host, port=server_config.port)