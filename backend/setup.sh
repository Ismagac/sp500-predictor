#!/bin/bash

# Script para instalar y ejecutar el backend

echo "=== SP500 Prediction Backend Setup ==="

# Verificar Python
if ! command -v python &> /dev/null; then
    echo "Error: Python no está instalado"
    exit 1
fi

echo "✓ Python encontrado: $(python --version)"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install -r requirements.txt

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "⚙️ Creando archivo .env..."
    cp .env.example .env
    echo ""
    echo "🚨 IMPORTANTE: Edita el archivo .env con tus credenciales de AWS:"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
    echo "   - S3_BUCKET_NAME"
    echo "   - S3_MODEL_KEY"
    echo ""
fi

echo "✅ Backend setup completado!"
echo ""
echo "Para ejecutar el backend:"
echo "  python main.py"
echo ""
echo "El servidor estará disponible en: http://localhost:8000"
