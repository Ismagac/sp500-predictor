# 📈 SP500 Predictor

Un dashboard inteligente para predicción del índice S&P 500 usando análisis técnico y de sentimiento, con machine learning y datos en tiempo real.

![SP500 Predictor](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Python](https://img.shields.io/badge/Python-3.12+-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.4-green)

## 🚀 Características

- **Análisis Técnico**: Predicciones usando modelo XGBoost con indicadores técnicos
- **Análisis de Sentimiento**: Sentimiento del mercado basado en noticias de los últimos 7 días
- **Noticias Influyentes**: Cards de artículos de noticias que afectan el mercado
- **Datos en Tiempo Real**: Precios actuales del SP500 vía Yahoo Finance
- **Tema Oscuro**: Interfaz moderna con paleta de colores económica
- **Interfaz en Español**: Completamente traducida para hispanohablantes

## 🏗️ Arquitectura

### Frontend (React + TypeScript)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS con tema oscuro personalizado
- **Charts**: Recharts para visualización de datos
- **Icons**: Lucide React

### Backend (Python + FastAPI)
- **API**: FastAPI para endpoints de predicción y datos de mercado
- **ML Model**: XGBoost cargado desde AWS S3
- **Market Data**: Yahoo Finance para datos del SP500
- **Technical Analysis**: Biblioteca TA-Lib para indicadores

## 🚀 Inicio Rápido

### Opción 1: Un Solo Comando (Recomendado)

**Windows (PowerShell):**
```bash
npm run start
```

**Windows (Command Prompt):**
```bash
npm run start:win
```

**Linux/Mac:**
```bash
npm run start:unix
```

### URLs de Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📦 Instalación

### Frontend

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Ejecutar en desarrollo
npm run dev
```

### Backend

```bash
cd backend

# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh

# Ejecutar manualmente
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con credenciales de AWS
python main.py
```

## ⚙️ Configuración

### Variables de Entorno - Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_POLYGON_API_KEY=tu_api_key_polygon
```

### Variables de Entorno - Backend (.env)
```env
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=sp500-models
S3_MODEL_KEY=xgboost_sp500_model.pkl
POLYGON_API_KEY=tu_api_key_polygon
PORT=8000
DEBUG=true
```

## 🤖 Modelo XGBoost

El modelo espera un archivo `.pkl` en S3 con las siguientes características:
- Precio actual
- RSI (14 períodos)
- MACD (línea, señal, histograma)
- Medias móviles (10, 20, 50, 100, 200)
- Bandas de Bollinger (superior, media, inferior)
- ADX, OBV
- Retornos 1d y 5d
- Volatilidad 20 períodos
- Volumen

## 📊 Características del Dashboard

### Análisis Técnico
- ✅ Predicción de precio usando XGBoost real (vía backend)
- ✅ Fallback a predicción mock si backend no disponible
- ✅ Visualización de tendencia (alcista/bajista/neutral)
- ✅ Nivel de confianza de la predicción
- ✅ Gráfico de precios con predicción
- ✅ Panel de indicadores técnicos (RSI, MACD, SMA, Bollinger)

### Análisis de Sentimiento
- ✅ Análisis de sentimiento de noticias (últimos 7 días)
- ✅ Score de sentimiento (-1 a 1)
- ✅ Breakdown por categorías (positivo/negativo/neutral)
- ✅ Botón de recarga independiente

### Noticias Influyentes
- ✅ Cards de noticias con nivel de influencia
- ✅ Análisis de sentimiento por artículo
- ✅ Enlaces externos a artículos completos
- ✅ Keywords y metadatos

## 🔄 Lógica de Actualización

- **Análisis Técnico**: Se actualiza automáticamente 1 vez por día después del cierre del mercado
- **Sentimiento y Noticias**: Se pueden recargar manualmente desde la interfaz
- **Datos de Mercado**: Cache de 5 minutos para optimizar rendimiento

## 🌐 Despliegue

### Frontend (GitHub Pages)
```bash
# Configurar variables de producción en .env.production
VITE_API_URL=https://tu-backend-desplegado.railway.app

# Desplegar automáticamente
npm run deploy

# El sitio estará disponible en:
# https://tuusuario.github.io/sp500-predictor
```

### Backend (Railway/Heroku)
Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas de despliegue del backend.

**Plataformas recomendadas:**
- **Railway** (fácil y rápido)
- **Heroku** (gratuito con limitaciones)
- **DigitalOcean App Platform**
- **AWS ECS**

## 🚨 Solución CORS

El acceso directo a S3 desde el frontend está bloqueado por CORS. Por eso se implementó un backend que:
1. Carga el modelo XGBoost desde S3
2. Obtiene datos de mercado en tiempo real
3. Calcula indicadores técnicos
4. Retorna predicciones vía API REST

## 🎨 Diseño

- **Tema**: Oscuro con acentos morados/azules
- **Layout**: Responsive para móvil y desktop
- **Tipografía**: Inter font family
- **Colores**: Paleta económica profesional
- **Componentes**: Modulares y reutilizables

## 🔧 Desarrollo

```bash
# Frontend
npm run dev        # Servidor de desarrollo (puerto 5177)
npm run build      # Build para producción
npm run preview    # Preview del build

# Backend
python main.py     # Servidor FastAPI (puerto 8000)
```

## 📝 Notas

- El precio del SP500 mostrado ahora es realista (~6,184) en lugar del mock anterior (614)
- Se usa Yahoo Finance para datos reales del mercado
- El modelo XGBoost se carga desde S3 cuando el backend está configurado
- Fallback a predicción mock si el backend no está disponible
- Interfaz completamente en español

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
