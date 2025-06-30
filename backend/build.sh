# Railway Build Script
echo "Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --no-cache-dir --verbose

echo "Testing imports..."
python -c "import fastapi; import uvicorn; import pandas; import numpy; print('All imports successful')"

echo "Build completed successfully!"
