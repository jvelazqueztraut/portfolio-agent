import os
from dataclasses import dataclass
from typing import List

@dataclass
class ServerConfig:
    """Configuration for the FastAPI server"""
    host: str = 'localhost'
    port: int = 8000
    reload: bool = True
    cors_origins: List[str] = None
    
    def __post_init__(self):
        if self.cors_origins is None:
            # Get environment-specific origins
            self.cors_origins = self._get_cors_origins()
    
    def _get_cors_origins(self) -> List[str]:
        """Get CORS origins based on environment"""
        # Default development origins
        origins = [
            "http://localhost:3000",
            "https://localhost:3001",
            "http://127.0.0.1:3000",
            "https://127.0.0.1:3001",
        ]
        
        frontend_url = os.getenv("FRONTEND_URL")
        if frontend_url:
            origins.append(frontend_url)

        # Remove duplicates while preserving order
        seen = set()
        unique_origins = []
        for origin in origins:
            if origin not in seen:
                seen.add(origin)
                unique_origins.append(origin)
        
        return unique_origins

# Create global server configuration instance
server_config = ServerConfig()
