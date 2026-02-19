# Portfolio Agent Backend

A Python backend using FastAPI and pydantic_ai for AI-powered functionality.

## Quick Start

### Option 1: Using the install script (Recommended)

```bash
./install.sh
```

### Option 2: Manual installation

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env  # Copy example file
   # Edit .env and add your API keys
   ```

## Running the Application

```bash
# Activate virtual environment
source venv/bin/activate
# Win: .\venv\Scripts\Activate.ps1

# Run the application
python main.py
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
GOOGLE_API_KEY=your_google_api_key_here # Previously GEMINI_API_KEY
LOGFIRE_TOKEN=your_logfire_project_write_token_here
```

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI applications
- **pydantic_ai**: AI framework for building intelligent applications
- **python-dotenv**: Load environment variables from .env file
- **logfire**: Structured logging and observability
- **httpx**: HTTP client library

## Project Structure

```
backend/
├── main.py              # Main application file
├── requirements.txt     # Python dependencies
├── install.sh          # Installation script
├── .env                # Environment variables (create this)
└── venv/               # Virtual environment (created during setup)
```
