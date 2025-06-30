from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging
import os
import sys
from datetime import datetime, timedelta

from model_service import model_service
from market_service import market_service

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SP500 Prediction API",
    description="API for SP500 predictions using XGBoost model",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5177", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionResponse(BaseModel):
    prediction: float
    value: float  # Para compatibilidad hacia atrás
    confidence: float
    direction: str
    trend: str
    probability: float
    targetPrice: float
    timeframe: str
    factors: Dict[str, float]
    technicalIndicators: Dict
    lastUpdated: str

class MarketDataResponse(BaseModel):
    price: float
    open: float
    high: float
    low: float
    volume: int
    previousClose: float
    change: float
    changePercent: float
    timestamp: str

# Endpoint raíz
@app.get("/")
async def root():
    return {"message": "SP500 Prediction API", "status": "online"}

# Endpoint de salud
@app.get("/health")
async def health_check():
    health_info = {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "port": os.getenv("PORT", "8000"),
        "host": os.getenv("HOST", "0.0.0.0"),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "environment": "production" if not os.getenv("DEBUG", "false").lower() == "true" else "development"
    }
    
    logger.info(f"Health check accessed: {health_info}")
    return health_info

# Devuelve los datos actuales del mercado SP500
@app.get("/api/market/current", response_model=MarketDataResponse)
async def get_current_market_data():
    """Obtener datos actuales del mercado SP500"""
    try:
        data = await market_service.get_current_sp500_data()
        if data is None:
            raise HTTPException(status_code=500, detail="Error al obtener datos del mercado")
        
        return MarketDataResponse(**data)
        
    except Exception as e:
        logger.error(f"Error al obtener datos del mercado: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Devuelve la predicción del modelo para el SP500
@app.get("/api/prediction", response_model=PredictionResponse)
async def get_prediction():
    """Obtener predicción del SP500 utilizando el modelo XGBoost"""
    try:
        logger.info("Iniciando solicitud de predicción")
        
        # Obtener datos actuales del mercado
        logger.info("Obteniendo datos del mercado...")
        market_data = await market_service.get_current_sp500_data()
        if market_data is None:
            logger.error("Error al obtener datos del mercado")
            raise HTTPException(status_code=500, detail="Error al obtener datos del mercado")
        logger.info(f"Datos del mercado obtenidos: precio={market_data['price']}")
        
        # Obtener características para la predicción
        logger.info("Preparando características para la predicción...")
        features = await market_service.get_features_for_prediction()
        if features is None:
            logger.error("Error al preparar características")
            raise HTTPException(status_code=500, detail="Error al preparar características")
        logger.info(f"Características preparadas: {len(features)} características")
        
        # Realizar la predicción
        logger.info("Realizando la predicción...")
        prediction_result = await model_service.predict(features)
        if prediction_result is None:
            logger.error("Error al realizar la predicción")
            raise HTTPException(status_code=500, detail="Error al realizar la predicción")
        logger.info(f"Predicción realizada: {prediction_result}")
        
        # Obtener indicadores técnicos
        logger.info("Obteniendo indicadores técnicos...")
        try:
            tech_indicators = await market_service.get_technical_indicators_summary()
            if tech_indicators is None:
                logger.error("Error al obtener indicadores técnicos")
                raise HTTPException(status_code=500, detail="Error al obtener indicadores técnicos")
            logger.info("Indicadores técnicos obtenidos")
        except Exception as tech_error:
            logger.error(f"Error al obtener indicadores técnicos: {tech_error}")
            # Usar un fallback o indicadores técnicos simulados
            tech_indicators = {
                "rsi": prediction_result.get('prediction', 0.5) * 100,
                "macd": "neutral",
                "bollinger": "normal",
                "trend": "sideways"
            }
        
        # Calcular valores derivados
        current_price = market_data['price']
        prediction_value = prediction_result['prediction']
        
        # Determinar dirección y tendencia
        if prediction_value > 0.6:
            direction = "up"
            trend = "bullish"
        elif prediction_value < 0.4:
            direction = "down"
            trend = "bearish"
        else:
            direction = "neutral"
            trend = "neutral"
        
        # Calcular precio objetivo (la predicción es típicamente un cambio porcentual)
        # Suponiendo que la predicción es un valor normalizado, convertir a cambio de precio
        price_change_percent = (prediction_value - 0.5) * 10  # Convertir a porcentaje
        target_price = current_price * (1 + price_change_percent / 100)
        
        response = PredictionResponse(
            prediction=prediction_value,
            value=target_price,  # Precio predicho
            confidence=prediction_result['confidence'],
            direction=direction,
            trend=trend,
            probability=prediction_value,
            targetPrice=target_price,
            timeframe="5 días",
            factors={
                "technical": 0.7,
                "sentiment": 0.2,
                "momentum": 0.1
            },
            technicalIndicators=tech_indicators,
            lastUpdated=datetime.now().isoformat()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error en el endpoint de predicción: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Devuelve datos históricos del mercado SP500
@app.get("/api/market/historical")
async def get_historical_data(period: str = "1mo"):
    """Obtener datos históricos del mercado"""
    try:
        hist_data = await market_service.get_historical_data(period)
        if hist_data is None:
            raise HTTPException(status_code=500, detail="Error al obtener datos históricos")
        
        # Convertir a lista de diccionarios
        data = []
        for idx, row in hist_data.iterrows():
            data.append({
                "timestamp": idx.isoformat(),
                "price": float(row['Close']),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "volume": int(row['Volume']),
                "change": float(row['Close'] - row['Open']),
                "changePercent": float((row['Close'] - row['Open']) / row['Open'] * 100)
            })
        
        return {"data": data[-30:]}  # Devolver últimos 30 días
        
    except Exception as e:
        logger.error(f"Error al obtener datos históricos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint de depuración para datos del mercado
@app.get("/debug/market-data")
async def debug_market_data():
    """Endpoint de depuración para verificar la obtención de datos del mercado"""
    try:
        logger.info("Depuración: Probando obtención de datos del mercado")
        market_data = await market_service.get_current_sp500_data()
        logger.info(f"Depuración: Resultado de datos del mercado: {market_data}")
        return {"success": True, "data": market_data}
    except Exception as e:
        logger.error(f"Depuración: Error en datos del mercado: {str(e)}")
        return {"success": False, "error": str(e)}

# Endpoint de depuración para preparación de características
@app.get("/debug/features")
async def debug_features():
    """Endpoint de depuración para verificar la preparación de características"""
    try:
        logger.info("Depuración: Probando preparación de características")
        features = await market_service.get_features_for_prediction()
        logger.info(f"Depuración: Resultado de características: {features}")
        return {"success": True, "features": features, "count": len(features) if features else 0}
    except Exception as e:
        logger.error(f"Depuración: Error en características: {str(e)}")
        return {"success": False, "error": str(e)}

# Endpoint de depuración para estado del modelo
@app.get("/debug/model")
async def debug_model():
    """Endpoint de depuración para verificar el estado del modelo"""
    try:
        logger.info("Depuración: Probando servicio de modelo")
        
        # Verificar si el modelo está cargado
        model_status = {
            "model_loaded": model_service.model is not None,
            "model_type": str(type(model_service.model)) if model_service.model else None
        }
        
        # Intentar hacer una predicción simple con datos de ejemplo
        if model_service.model:
            dummy_features = [6200.0] + [50.0] * 22  # 23 características en total
            try:
                prediction = await model_service.predict(dummy_features)
                model_status["dummy_prediction"] = prediction
                model_status["prediction_success"] = True
            except Exception as e:
                model_status["prediction_error"] = str(e)
                model_status["prediction_success"] = False
        
        return {"success": True, "model_status": model_status}
    except Exception as e:
        logger.error(f"Depuración: Error en prueba de modelo: {str(e)}")
        return {"success": False, "error": str(e)}

@app.on_event("startup")
async def startup_event():
    """Cargar modelo al iniciar"""
    logger.info("Iniciando API de Predicción SP500...")
    
    # Pre-cargar el modelo (sin fallar si no se puede cargar)
    try:
        success = await model_service.load_model()
        if success:
            logger.info("Modelo cargado exitosamente")
        else:
            logger.warning("Error al cargar el modelo - se utilizará un fallback")
    except Exception as e:
        logger.warning(f"No se pudo cargar el modelo en startup: {str(e)} - continuando con fallback")
    
    logger.info("API de Predicción SP500 iniciada correctamente")

if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT, DEBUG
    
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
        log_level="info" if DEBUG else "warning"
    )
