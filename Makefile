# LyceeProject Makefile
.PHONY: help build up down logs clean install test

# Afficher l'aide
help:
	@echo "Commandes disponibles:"
	@echo "  make build     - Construire toutes les images Docker"
	@echo "  make up        - Démarrer tous les services"
	@echo "  make down      - Arrêter tous les services"
	@echo "  make logs      - Afficher les logs en temps réel"
	@echo "  make clean     - Nettoyer les containers et volumes"
	@echo "  make install   - Installer les dépendances (dev local)"
	@echo "  make test      - Lancer les tests"
	@echo "  make restart   - Redémarrer tous les services"
	@echo "  make db        - Accéder à la base de données"

# Construire toutes les images
build:
	docker-compose build

# Démarrer tous les services
up:
	docker-compose up -d
	@echo "🚀 Services démarrés !"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3001"
	@echo "Database: localhost:5432"

# Arrêter tous les services
down:
	docker-compose down

# Afficher les logs
logs:
	docker-compose logs -f

# Nettoyer containers et volumes
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Installer les dépendances pour le développement local
install:
	cd frontend && npm install
	cd backend && npm install

# Lancer les tests
test:
	cd backend && npm test
	cd frontend && npm test

# Redémarrer tous les services
restart: down up

# Accéder à la base de données PostgreSQL
db:
	docker-compose exec database psql -U postgres -d lyceeproject

# Démarrage en mode développement
dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

# Construire et démarrer
start: build up

# État des services
status:
	docker-compose ps 