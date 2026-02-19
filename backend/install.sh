#!/bin/bash

# Portfolio Agent Backend Installation Script
echo "🚀 Setting up Portfolio Agent Backend..."

# Check if Python 3.12+ is available
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
required_version="3.12"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.12+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating template..."
    echo "# Add your API keys here" > .env
    echo "GOOGLE_API_KEY=your_gemini_api_key_here" >> .env
    echo "LOGFIRE_TOKEN=your_logfire_project_write_token_here" >> .env
    echo "📝 Please edit .env file and add your API keys"
fi

echo "✅ Installation complete!"
echo ""
echo "To run the backend:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Add your API keys to .env file"
echo "3. Run: python main.py"
echo ""
echo "Happy coding! 🎉"
