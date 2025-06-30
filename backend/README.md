# SP500 Prediction Backend

Backend API para el dashboard de predicción del SP500 usando XGBoost.

## Instalación

1. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales de AWS
```

3. Ejecutar el servidor:
```bash
python main.py
```

El servidor estará disponible en `http://localhost:8000`

## Endpoints

- `GET /` - Información general de la API
- `GET /health` - Health check
- `GET /api/market/current` - Datos actuales del SP500
- `GET /api/prediction` - Predicción usando el modelo XGBoost
- `GET /api/market/historical?period=1mo` - Datos históricos

## Configuración de AWS

Para que funcione el modelo desde S3, necesitas:

1. Credenciales de AWS con acceso a S3
2. Un bucket S3 con el modelo XGBoost entrenado
3. El modelo debe estar en formato joblib (.joblib) o pickle (.pkl)

### Ejemplo de configuración en .env:
```env
AWS_ACCESS_KEY_ID=EXAMPLE_AWS_KEY_123
AWS_SECRET_ACCESS_KEY=EXAMPLE_AWS_SECRET_456
S3_BUCKET_NAME=example-sp500-models
S3_MODEL_KEY=models/xgboost_sp500_model.pkl
```

### Estructura S3:
```
s3://sp500-technical-analysis-ismaelgc/
└── models/
    └── sp500_xgb_model.joblib
```

## Datos del Modelo

El modelo espera las siguientes características:
- Precio actual
- RSI (14 períodos)
- MACD (línea y señal)
- Medias móviles (10, 20, 50, 100, 200)
- Bandas de Bollinger
- ADX
- OBV
- Retornos 1d y 5d
- Volatilidad 20 períodos
- Volumen
- Posición en Bandas de Bollinger
- Distancia a medias móviles

## CORS

El backend está configurado para permitir requests desde:
- http://localhost:5177 (Vite dev server)
- http://localhost:3000 (React dev server)
- http://localhost:5173 (Vite alternative port)
