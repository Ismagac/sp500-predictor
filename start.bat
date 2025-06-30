@echo off
echo Iniciando SP500 Predictor Dashboard...
echo.

REM Verificar si el entorno virtual existe
if not exist "venv\Scripts\activate.bat" (
    echo Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual e instalar dependencias del backend
echo Activando entorno virtual e instalando dependencias del backend...
call venv\Scripts\activate.bat
cd backend
pip install -r requirements-simple.txt
echo.

REM Iniciar backend en segundo plano
echo Iniciando backend FastAPI en puerto 8000...
start /b python main.py
cd ..
echo Backend iniciado!
echo.

REM Instalar dependencias del frontend si no existen
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    npm install
    echo.
)

REM Iniciar frontend
echo Iniciando frontend React en puerto 5173...
echo.
echo =================================================
echo   SP500 Predictor Dashboard se está iniciando...
echo   Backend API: http://localhost:8000
echo   Frontend: http://localhost:5173
echo =================================================
echo.
npm run dev
