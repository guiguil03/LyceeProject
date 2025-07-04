# Système d'Authentification LycéeConnect

## Vue d'ensemble

Le système d'authentification de LycéeConnect permet la gestion des comptes utilisateurs avec deux types de profils :
- **Entreprises** : pour rechercher des lycées partenaires
- **Lycées (RBDE)** : pour valoriser leur établissement et gérer les demandes

## Architecture

### Backend (Node.js/Express)

#### Services créés
- `backend/src/config/database.ts` - Configuration PostgreSQL
- `backend/src/services/authService.ts` - Logique d'authentification
- `backend/src/middleware/auth.ts` - Middleware de protection des routes
- `backend/src/routes/auth.ts` - Routes d'authentification

#### Endpoints API

**POST /api/auth/login**
- Connexion d'un utilisateur
- Body: `{ email: string, password: string }`
- Retourne: `{ user, token }`

**POST /api/auth/register/entreprise**
- Inscription d'une entreprise
- Body: `{ nom, siret, secteur, adresse, email, password, contactNom?, contactPrenom? }`
- Retourne: `{ user, entreprise, token }`

**POST /api/auth/register/lycee**
- Inscription d'un lycée
- Body: `{ nom, adresse, email, password, rbdeNom, rbdePrenom, rbdeEmail, telephone?, description? }`
- Retourne: `{ user, lycee, token }`

**GET /api/auth/profile** (protégé)
- Récupération du profil utilisateur complet
- Headers: `Authorization: Bearer <token>`

**GET /api/auth/verify** (protégé)
- Vérification de la validité du token

**POST /api/auth/logout** (protégé)
- Déconnexion

### Frontend (Next.js/React)

#### Services créés
- `frontend/src/services/authService.ts` - Client API d'authentification

#### Pages mises à jour
- `/login` - Page de connexion avec sélection du profil
- `/register/entreprise` - Inscription entreprise
- `/register/lycee` - Inscription lycée

## Configuration

### Variables d'environnement (Backend)

Copier `backend/env.example` vers `backend/.env` et configurer :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5433
DB_NAME=lyceeproject
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=votre_secret_jwt_securise
JWT_EXPIRES_IN=7d

# Serveur
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Base de données

Les tables nécessaires doivent être créées en base :

```sql
-- Table des utilisateurs
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'rbde', 'entreprise')),
  full_name VARCHAR(255),
  lycee_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des entreprises
CREATE TABLE "Entreprise" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  siret VARCHAR(14) UNIQUE NOT NULL,
  secteur VARCHAR(255) NOT NULL,
  adresse TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lycées
CREATE TABLE "Lycee" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  adresse TEXT NOT NULL,
  region_id VARCHAR(50),
  description TEXT,
  site_web VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Sécurité

### Côté Backend
- Mots de passe hachés avec bcryptjs (12 rounds)
- Tokens JWT sécurisés avec expiration
- Validation des données d'entrée
- Protection CORS configurée
- Headers de sécurité avec Helmet

### Côté Frontend
- Stockage sécurisé des tokens en localStorage
- Vérification automatique de la validité des tokens
- Redirection automatique selon les rôles
- Gestion des erreurs d'authentification

## Utilisation

### Inscription

**Entreprise :**
1. Aller sur `/register/entreprise`
2. Remplir les informations (nom, SIRET, secteur, etc.)
3. Redirection automatique vers `/search`

**Lycée :**
1. Aller sur `/register/lycee`
2. Remplir les informations établissement + responsable RBDE
3. Redirection automatique vers `/lycee/dashboard`

### Connexion

1. Aller sur `/login`
2. Choisir le profil (entreprise ou lycée)
3. Saisir email et mot de passe
4. Redirection selon le rôle :
   - Entreprise → `/search`
   - RBDE → `/lycee/dashboard`

### Protection des routes

```typescript
// Middleware disponibles
import { authenticateToken, requireEntreprise, requireRBDE } from '../middleware/auth';

// Route protégée pour tous les utilisateurs connectés
router.get('/protected', authenticateToken, handler);

// Route réservée aux entreprises
router.get('/entreprises-only', authenticateToken, requireEntreprise, handler);

// Route réservée aux RBDE
router.get('/lycees-only', authenticateToken, requireRBDE, handler);
```

### Utilisation côté frontend

```typescript
import authService from '@/services/authService';

// Connexion
const response = await authService.login({ email, password });

// Inscription entreprise
const response = await authService.registerEntreprise(data);

// Vérifier si connecté
const isAuth = authService.isAuthenticated();

// Obtenir l'utilisateur actuel
const user = authService.getCurrentUser();

// Déconnexion
await authService.logout();
```

## Démarrage

1. **Backend :**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Configurer .env
   npm run dev
   ```

2. **Base de données :**
   - Démarrer PostgreSQL
   - Créer les tables nécessaires

3. **Frontend :**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Tester :**
   - Aller sur http://localhost:3000
   - Créer un compte ou se connecter
   - Vérifier les redirections selon les rôles

## Dépendances

### Backend
- `bcryptjs` - Hachage des mots de passe
- `jsonwebtoken` - Gestion des tokens JWT
- `pg` - Client PostgreSQL

### Frontend
- Service d'authentification intégré à l'API existante

## Prochaines étapes

1. Ajouter la persistance des sessions
2. Implémenter la récupération de mot de passe
3. Ajouter la validation par email
4. Système de rôles plus granulaire
5. Audit trail des connexions 