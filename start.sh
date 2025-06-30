#!/bin/bash

echo "Iniciando SP500 Predictor Dashboard..."
echo

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual e instalar dependencias del backend
echo "Activando entorno virtual e instalando dependencias del backend..."
source venv/bin/activate
cd backend
pip install -r requirements-simple.txt
echo

# Iniciar backend en segundo plano
echo "Iniciando backend FastAPI en puerto 8000..."
python main.py &
BACKEND_PID=$!
cd ..
echo "Backend iniciado con PID: $BACKEND_PID"
echo

# Instalar dependencias del frontend si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    npm install
    echo
fi

# Función para limpiar procesos al salir
cleanup() {
    echo
    echo "Cerrando backend..."
    kill $BACKEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Iniciar frontend
echo "Iniciando frontend React en puerto 5173..."
echo
echo "================================================="
echo "   SP500 Predictor Dashboard se está iniciando..."
echo "   Backend API: http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "================================================="
echo

npm run dev
