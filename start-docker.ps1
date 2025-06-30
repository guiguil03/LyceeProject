# Script pour démarrer l'application complète avec Docker

Write-Host "🚀 Démarrage de LyceeProject avec Docker..." -ForegroundColor Green

# Arrêter les conteneurs existants
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Reconstruire et démarrer
Write-Host "🔨 Reconstruction des images..." -ForegroundColor Blue
docker-compose build

Write-Host "🚀 Démarrage des conteneurs..." -ForegroundColor Blue
docker-compose up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier l'état
Write-Host "📊 État des conteneurs:" -ForegroundColor Green
docker-compose ps

Write-Host "✅ Application démarrée!" -ForegroundColor Green
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "📍 Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "📍 Health check: http://localhost:3001/health" -ForegroundColor Yellow

Read-Host "Appuyez sur Entrée pour continuer..." 