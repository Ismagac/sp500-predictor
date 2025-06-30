#!/bin/bash
# Railway startup script

echo "🚀 Starting Railway Web Service"
echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

echo "🐍 Python version:"
python --version

echo "📦 Installing/checking dependencies:"
pip list | grep -E "(fastapi|uvicorn|pandas|numpy)"

echo "🔌 Environment variables:"
echo "PORT: $PORT"
echo "RAILWAY_ENVIRONMENT: $RAILWAY_ENVIRONMENT"

echo "🌐 Starting web server..."
exec python start_server.py
