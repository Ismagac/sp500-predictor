# SP500 Predictor Dashboard - Startup Script
Write-Host "Iniciando SP500 Predictor Dashboard..." -ForegroundColor Green
Write-Host ""

# Verificar si el entorno virtual existe
if (!(Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    python -m venv venv
}

# Activar entorno virtual e instalar dependencias del backend
Write-Host "Configurando backend..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
Set-Location backend
pip install -r requirements-simple.txt | Out-Null
Write-Host ""

# Iniciar backend en segundo plano
Write-Host "Iniciando backend FastAPI en puerto 8000..." -ForegroundColor Cyan
# $backend = Start-Process -FilePath "python" -ArgumentList "main.py" -PassThru -WindowStyle Hidden
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; .\..\venv\Scripts\Activate.ps1; python main.py"

# Esperar a que el backend esté listo
Write-Host "Esperando a que el backend se inicie..."
Start-Sleep -Seconds 10

# Instalar dependencias del frontend si no existen
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install | Out-Null
    Write-Host ""
}

# Función para limpiar procesos al salir
$cleanup = {
    Write-Host ""
    Write-Host "Cerrando backend..." -ForegroundColor Red
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    exit
}

Register-EngineEvent PowerShell.Exiting -Action $cleanup

# Iniciar frontend
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host "   SP500 Predictor Dashboard se está iniciando..." -ForegroundColor Magenta
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Presiona Ctrl+C para detener ambos servicios" -ForegroundColor Yellow
Write-Host ""

npm run dev
