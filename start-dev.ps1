# Script pour démarrer l'application en mode développement

Write-Host "🚀 Démarrage de LyceeProject en mode développement..." -ForegroundColor Green

# Démarrer le backend
Write-Host "📡 Démarrage du backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Attendre un moment pour que le backend démarre
Start-Sleep -Seconds 3

# Démarrer le frontend
Write-Host "🌐 Démarrage du frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ Les services sont en cours de démarrage..." -ForegroundColor Green
Write-Host "📍 Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "📍 Health check: http://localhost:3001/api/health" -ForegroundColor Yellow
Write-Host "📍 Test lycées: http://localhost:3001/api/test/lycees" -ForegroundColor Yellow

Read-Host "Appuyez sur Entrée pour continuer..." 