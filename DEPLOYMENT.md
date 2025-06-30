# 🚀 Guía de Despliegue

Esta guía te ayudará a desplegar el SP500 Predictor de forma segura en producción.

## 📋 Pre-requisitos

- Cuenta de GitHub
- Cuenta en Railway/Heroku/DigitalOcean (para el backend)
- Credenciales de AWS (para el modelo XGBoost)
- API Key de Polygon.io (opcional)

## 🌐 Despliegue del Frontend (GitHub Pages)

### 1. Preparar el Repositorio

```bash
# Inicializar git (si no está ya)
git init

# Añadir remote (reemplaza con tu URL)
git remote add origin https://github.com/tuusuario/sp500-predictor.git

# Hacer el primer commit
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: Selecciona `gh-pages`
5. Folder: `/ (root)`

### 3. Configurar Variables de Producción

Edita `.env.production`:
```env
# URL de tu backend desplegado
VITE_API_URL=https://tu-backend.railway.app

# API Key de Polygon (opcional)
VITE_POLYGON_API_KEY=tu_clave_polygon
```

### 4. Desplegar

```bash
# Construir y desplegar
npm run deploy
```

Tu frontend estará disponible en: `https://tuusuario.github.io/sp500-predictor`

## 🐍 Despliegue del Backend

### Opción 1: Railway (Recomendado)

1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar GitHub**: Autoriza Railway a acceder a tu repo
3. **Crear nuevo proyecto**: "Deploy from GitHub repo"
4. **Seleccionar carpeta**: `backend/`
5. **Configurar variables de entorno**:
   ```
   AWS_ACCESS_KEY_ID=tu_access_key
   AWS_SECRET_ACCESS_KEY=tu_secret_key
   S3_BUCKET_NAME=sp500-models
   S3_MODEL_KEY=xgboost_sp500_model.pkl
   POLYGON_API_KEY=tu_clave_polygon
   PORT=8000
   DEBUG=false
   ```
6. **Desplegar**: Railway detectará automáticamente Python y desplegará

### Opción 2: Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Crear app
heroku create tu-sp500-backend

# Configurar variables
heroku config:set AWS_ACCESS_KEY_ID=tu_access_key
heroku config:set AWS_SECRET_ACCESS_KEY=tu_secret_key
heroku config:set S3_BUCKET_NAME=sp500-models
heroku config:set S3_MODEL_KEY=xgboost_sp500_model.pkl
heroku config:set POLYGON_API_KEY=tu_clave_polygon
heroku config:set PORT=8000
heroku config:set DEBUG=false

# Crear Procfile en backend/
echo "web: python main.py" > backend/Procfile

# Desplegar
git subtree push --prefix backend heroku main
```

### Opción 3: DigitalOcean App Platform

1. **Crear cuenta**: https://cloud.digitalocean.com
2. **Apps → Create App**
3. **Conectar GitHub**: Selecciona tu repositorio
4. **Configurar**:
   - Source Directory: `backend/`
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `python main.py`
5. **Variables de entorno**: Añadir todas las variables de AWS y Polygon
6. **Desplegar**

## 🔐 Seguridad

### ✅ Qué Está Protegido
- ✅ Variables de entorno en `.env` no se suben al repo
- ✅ API keys solo en archivos de configuración local
- ✅ Credenciales de AWS solo en el backend desplegado
- ✅ CORS configurado correctamente
- ✅ No hay secrets hardcodeados en el código

### ⚠️ Checklist de Seguridad
- [ ] `.env` y `backend/.env` están en `.gitignore`
- [ ] No hay API keys en el código fuente
- [ ] Variables de producción configuradas en la plataforma de deploy
- [ ] Backend desplegado antes que frontend
- [ ] URL del backend actualizada en `.env.production`

## 🔧 Configuración Post-Despliegue

### 1. Actualizar Frontend
Una vez que tengas la URL del backend desplegado:

```bash
# Editar .env.production
VITE_API_URL=https://tu-backend-real.railway.app

# Re-desplegar
npm run deploy
```

### 2. Verificar Funcionamiento
- ✅ Frontend accesible en GitHub Pages
- ✅ Backend responde en `/health`
- ✅ API endpoints funcionan
- ✅ Datos reales del S&P 500 se cargan
- ✅ Predicciones XGBoost funcionan

### 3. Monitoreo
- Railway/Heroku proporcionan logs automáticos
- Configura alertas para downtime
- Monitorea uso de APIs (Polygon, Yahoo Finance)

## 🐛 Troubleshooting

### Frontend no carga datos
- Verificar que `VITE_API_URL` apunta al backend correcto
- Comprobar que el backend está funcionando (`/health`)
- Revisar CORS en el backend

### Backend no responde
- Verificar variables de entorno en la plataforma
- Revisar logs del servicio
- Comprobar credenciales de AWS

### Modelo XGBoost no carga
- Verificar que el archivo existe en S3
- Comprobar permisos de AWS
- Revisar formato del modelo (.pkl)

## 📞 Soporte

Si tienes problemas durante el despliegue:
1. Revisa los logs de la plataforma
2. Verifica todas las variables de entorno
3. Comprueba que el backend funciona en local
4. Abre un issue en GitHub con los detalles del error

---

¡Una vez desplegado, tu SP500 Predictor estará disponible 24/7 en internet! 🎉
