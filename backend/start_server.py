#!/usr/bin/env python3
"""
Script de inicio para Railway
"""
import os
import uvicorn
import sys

if __name__ == "__main__":
    # Railway asigna automáticamente el puerto, debemos usarlo
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"  # Siempre usar 0.0.0.0 para Railway
    
    print(f"🚀 Starting SP500 Prediction API server")
    print(f"📡 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🌍 Environment: {'production' if not os.getenv('DEBUG', 'false').lower() == 'true' else 'development'}")
    print(f"🏗️  Railway Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'not set')}")
    
    # Verificar que el archivo main.py existe
    if not os.path.exists("main.py"):
        print("❌ ERROR: main.py not found in current directory")
        print(f"📁 Current directory contents: {os.listdir('.')}")
        sys.exit(1)
    
    try:
        print("🔥 Starting uvicorn server...")
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            log_level="info",
            access_log=True,
            # Configuraciones adicionales para Railway
            server_header=False,
            date_header=False
        )
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
