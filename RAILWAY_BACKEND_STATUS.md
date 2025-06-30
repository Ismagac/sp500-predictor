# Railway Configuration Summary

## Backend Configuration Status ✅

Railway está configurado para usar el **backend principal completo** (`main.py`) con todas las funcionalidades.

### Archivos de Configuración

#### 1. `Procfile` - Railway Start Command
```
web: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### 2. `railway.json` - Railway Deploy Configuration
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python -m uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

#### 3. `nixpacks.toml` - Build Configuration
```toml
[start]
cmd = "python -m uvicorn main:app --host 0.0.0.0 --port $PORT"
```

#### 4. `.railwayignore` - Exclude Simple Files
Los archivos simples están excluidos del despliegue:
- `simple_main.py`
- `test_main.py` 
- `requirements-simple.txt`
- `requirements-minimal.txt`
- `railway-simple.json`
- `nixpacks-simple.toml`
- `Procfile.simple`

### Backend Principal (`main.py`) Features

✅ **FastAPI completa** con todos los endpoints
✅ **XGBoost model** cargado desde S3
✅ **Yahoo Finance** datos reales del mercado
✅ **Indicadores técnicos** calculados (RSI, MACD, Bollinger, etc.)
✅ **CORS configurado** para producción
✅ **Endpoints de debug** para troubleshooting
✅ **Manejo robusto de errores** con fallbacks
✅ **Logging completo** para monitoreo

### Endpoints Disponibles

- `GET /` - Información de diagnóstico
- `GET /health` - Health check
- `GET /api/market/current` - Datos actuales SP500
- `GET /api/prediction` - Predicción XGBoost completa
- `GET /api/market/historical` - Datos históricos
- `GET /debug/market-data` - Debug datos de mercado
- `GET /debug/features` - Debug características
- `GET /debug/model` - Debug estado del modelo

### Variables de Entorno en Railway

Asegúrate de que Railway tenga configuradas:
- `PORT` (automático en Railway)
- `AWS_ACCESS_KEY_ID` (para S3)
- `AWS_SECRET_ACCESS_KEY` (para S3)
- `S3_BUCKET_NAME=sp500-models`
- `S3_MODEL_KEY=xgboost_sp500_model.pkl`
- `DEBUG=false` (para producción)

### CORS Configuration

El backend está configurado para aceptar requests de:
- Frontend local (desarrollo)
- GitHub Pages (frontend en producción)
- Cualquier origin en producción (Railway)

### Verification

El backend principal ha sido probado localmente y funciona correctamente:
- ✅ Servidor arranca sin errores
- ✅ Endpoints responden correctamente
- ✅ Datos de mercado se obtienen en tiempo real
- ✅ Modelo XGBoost funciona (con fallback si S3 no disponible)

## Next Steps for Railway

1. **Deploy automático** se activará con el push a GitHub
2. **Railway detectará** automáticamente los archivos de configuración
3. **Start command** será: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Backend completo** se ejecutará con todas las funcionalidades

## Frontend Integration

El frontend en GitHub Pages ya está configurado para:
- ✅ Usar la URL de Railway cuando esté disponible
- ✅ Fallback a datos mock si Railway no responde
- ✅ CORS correctamente configurado

---
**Conclusión**: Railway ejecutará el backend principal completo (`main.py`) con todas las funcionalidades de predicción, no el simple.
