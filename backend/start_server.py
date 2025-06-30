#!/usr/bin/env python3
"""
Script de inicio para Railway
"""
import os
import uvicorn
import sys

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting server on {host}:{port}")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Environment: {'production' if not os.getenv('DEBUG', 'false').lower() == 'true' else 'development'}")
    
    try:
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
