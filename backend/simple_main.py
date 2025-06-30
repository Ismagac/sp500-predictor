#!/usr/bin/env python3
"""
Versión ultra-simplificada para Railway - solo lo esencial
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from datetime import datetime

# Crear app FastAPI simple
app = FastAPI(
    title="SP500 Prediction API",
    description="API simplificada para Railway",
    version="1.0.0"
)

# CORS básico
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint raíz ultra simple"""
    return {
        "message": "SP500 API funcionando en Railway!",
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "port": os.getenv("PORT", "no configurado"),
        "python": f"{sys.version_info.major}.{sys.version_info.minor}"
    }

@app.get("/health")
async def health():
    """Health check ultra simple"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "server": "Railway",
        "port": os.getenv("PORT", "8000")
    }

@app.get("/api/test")
async def test():
    """Endpoint de prueba"""
    return {
        "test": "ok",
        "message": "Railway backend funcionando correctamente",
        "timestamp": datetime.now().isoformat()
    }

# Para Railway
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Iniciando servidor en puerto {port}")
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
