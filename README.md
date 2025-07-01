# LyceeProject 🎓

Un système de gestion scolaire moderne développé avec React, Node.js et PostgreSQL.

## 🏗️ Architecture

Ce projet suit une architecture microservices avec :

- **Frontend** : React + TypeScript + Vite
- **Backend** : Node.js + Express + TypeScript  
- **Database** : PostgreSQL
- **Containerisation** : Docker + Docker Compose

## 📁 Structure du projet

```
LyceeProject/
├── frontend/           # Application React/Vite
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/            # API Node.js/Express
│   ├── src/
│   │   ├── index.ts
│   │   └── routes/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── database/           # Configuration PostgreSQL
│   ├── init.sql
│   └── Dockerfile
└── docker-compose.yml  # Orchestration des services
```

## 🚀 Démarrage rapide

### Prérequis
- Docker et Docker Compose installés
- Git

### Installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd LyceeProject
   ```

2. **Démarrer tous les services avec Docker**
   ```bash
   docker-compose up -d
   ```

3. **Accéder à l'application**
   - Frontend : http://localhost (port 80)
   - Backend API : http://localhost:3001
   - Base de données : localhost:5432

### Développement local

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run dev
```



## 🐳 Docker

### Services disponibles
- **database** : PostgreSQL 15 (port 5432)
- **backend** : Node.js API (port 3001)  
- **frontend** : React avec Nginx (port 80)

### Commandes utiles
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Reconstruire les images
docker-compose build

# Accéder à la base de données
docker-compose exec database psql -U postgres -d lyceeproject
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` dans le dossier backend et ajustez selon vos besoins :



## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend  
cd frontend
npm test
```

## 🚀 Déploiement

Le projet est prêt pour le déploiement avec Docker. Ajustez les variables d'environnement selon votre environnement de production.

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

