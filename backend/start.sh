#!/bin/bash
echo "Starting SP500 Prediction API..."
echo "Port: $PORT"
echo "Host: 0.0.0.0"
echo "Python version: $(python --version)"
echo "Working directory: $(pwd)"
echo "Environment variables:"
env | grep -E "(PORT|HOST|DEBUG|AWS_|POLYGON_)" || echo "No relevant env vars found"

# Start the application
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info
