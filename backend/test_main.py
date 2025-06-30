#!/usr/bin/env python3
"""
Minimal test version of the SP500 API for Railway debugging
"""
from fastapi import FastAPI
import os
import sys
from datetime import datetime

app = FastAPI(title="SP500 Test API")

@app.get("/")
async def root():
    return {
        "message": "SP500 Test API is running!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "port": os.getenv("PORT", "not set"),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting test API on port {port}")
    uvicorn.run("test_main:app", host="0.0.0.0", port=port, log_level="info")
