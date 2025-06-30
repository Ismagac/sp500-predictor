Write-Host "Verificando estado del SP500 Predictor Dashboard..." -ForegroundColor Green
Write-Host ""

# Verificar si los puertos están ocupados
try {
    $frontend = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -ErrorAction SilentlyContinue
    $backend = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -ErrorAction SilentlyContinue
} catch {
    $frontend = $false
    $backend = $false
}

Write-Host "Estado de los servicios:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if ($frontend) {
    Write-Host "Frontend (Vite): http://localhost:5173 - ACTIVO" -ForegroundColor Green
} else {
    Write-Host "Frontend (Vite): http://localhost:5173 - INACTIVO" -ForegroundColor Red
}

if ($backend) {
    Write-Host "Backend (FastAPI): http://localhost:8000 - ACTIVO" -ForegroundColor Green
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
} else {
    Write-Host "Backend (FastAPI): http://localhost:8000 - INACTIVO" -ForegroundColor Red
}

Write-Host ""

if ($frontend -and $backend) {
    Write-Host "Todos los servicios están funcionando correctamente!" -ForegroundColor Green
    Write-Host "Abrir dashboard: http://localhost:5173" -ForegroundColor Magenta
} else {
    Write-Host "Algunos servicios no están activos." -ForegroundColor Yellow
    Write-Host "Ejecuta 'npm run start' para iniciar todos los servicios." -ForegroundColor Yellow
}

Write-Host ""
