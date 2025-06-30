@echo off
REM Script para instalar y ejecutar el backend en Windows

echo === SP500 Prediction Backend Setup ===

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python no está instalado
    exit /b 1
)

echo ✓ Python encontrado
python --version

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔧 Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo 📚 Instalando dependencias...
pip install -r requirements.txt

REM Crear archivo .env si no existe
if not exist ".env" (
    echo ⚙️ Creando archivo .env...
    copy .env.example .env
    echo.
    echo 🚨 IMPORTANTE: Edita el archivo .env con tus credenciales de AWS:
    echo    - AWS_ACCESS_KEY_ID
    echo    - AWS_SECRET_ACCESS_KEY
    echo    - S3_BUCKET_NAME
    echo    - S3_MODEL_KEY
    echo.
)

echo ✅ Backend setup completado!
echo.
echo Para ejecutar el backend:
echo   python main.py
echo.
echo El servidor estará disponible en: http://localhost:8000

pause
