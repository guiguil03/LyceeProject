# 🎓 Système de Matching Lycées-Entreprises

## 📋 Description

Ce système permet aux entreprises de trouver des lycées professionnels correspondant à leur secteur d'activité et leur localisation pour recruter des alternants.

## 🚀 Fonctionnalités

### ✨ Pour les Entreprises
- **Recherche par SIRET** : Récupération automatique des informations d'entreprise
- **Recherche par secteur d'activité** : 11 secteurs supportés
- **Géolocalisation** : Utilisation de votre position actuelle
- **Filtres avancés** : Distance, type d'établissement, nombre de résultats
- **Score de correspondance** : Algorithme de matching intelligent

### 🏫 Pour les Lycées
- **Base de données complète** : API officielle de l'Éducation Nationale
- **Informations détaillées** : Contact, formations, localisation
- **Statut public/privé** : Filtrage selon vos préférences

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** + **Express** + **TypeScript**
- **API Sirene** (entreprises)
- **API Annuaire des lycées professionnels** (Éducation Nationale)
- **Algorithme de matching** avec scoring automatique

### Frontend
- **React** + **TypeScript** + **Tailwind CSS**
- Interface moderne et responsive
- Géolocalisation native

## 🚦 Démarrage Rapide

### 1. Installation des dépendances

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Démarrage automatique (Windows)

```powershell
# Depuis la racine du projet
.\start-dev.ps1
```

### 3. Démarrage manuel

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### 4. URLs d'accès

- **Application** : http://localhost:5173
- **API Backend** : http://localhost:3001
- **Health Check** : http://localhost:3001/api/health
- **Test Lycées** : http://localhost:3001/api/test/lycees

## 📍 Endpoints API

### Matching
- `POST /api/match/lycees` - Trouve des lycées pour une entreprise
- `GET /api/match/entreprises/:uai` - Trouve des entreprises près d'un lycée
- `GET /api/match/stats/:secteur` - Statistiques par secteur

### Lycées
- `GET /api/lycees/search` - Recherche de lycées
- `GET /api/lycees/secteur/:secteur` - Lycées par secteur
- `GET /api/lycees/:uai` - Détails d'un lycée

### Entreprises
- `GET /api/entreprises/search` - Recherche d'entreprises
- `GET /api/entreprises/:siret` - Détails d'une entreprise

### Utilitaires
- `GET /api/secteurs` - Liste des secteurs supportés
- `GET /api/health` - État de l'API

## 🎯 Secteurs d'Activité Supportés

1. **Informatique et numérique**
2. **Commerce et vente**
3. **Industrie et mécanique**
4. **Bâtiment et travaux publics**
5. **Restauration et hôtellerie**
6. **Transport et logistique**
7. **Santé et social**
8. **Agriculture**
9. **Finance et assurance**
10. **Immobilier**
11. **Conseil et services**

## 🔍 Exemple d'Utilisation

### 1. Recherche par SIRET
```
SIRET: 78467169500
Secteur: Automatiquement détecté
Localisation: Automatiquement remplie
```

### 2. Recherche Manuelle
```
Secteur: Informatique et numérique
Commune: Paris
Distance max: 50 km
Type: Tous les établissements
```

## 🏆 Algorithme de Scoring

Le système attribue des points selon :
- **Secteur compatible** : +40 points
- **Même commune** : +30 points
- **Même département** : +20 points
- **Distance < 10km** : +25 points
- **Distance < 25km** : +15 points
- **Distance < 50km** : +5 points
- **Établissement public** : +5 points
- **Contact disponible** : +5 points

**Seuil minimum** : 10 points pour être affiché

## 🐛 Dépannage

### Erreur réseau
1. Vérifiez que le backend tourne sur le port 3001
2. Testez l'endpoint : http://localhost:3001/api/health

### API externe indisponible
- L'API des lycées peut parfois être lente
- Réessayez après quelques secondes

### Géolocalisation
- Autorisez l'accès à votre position dans le navigateur
- Ou saisissez manuellement votre localisation

## 🔧 Configuration

### Variables d'environnement
```bash
# Backend
PORT=3001
NODE_ENV=development

# Frontend  
VITE_API_URL=http://localhost:3001/api
```

## 📞 Support

En cas de problème, vérifiez :
1. **Health check** : http://localhost:3001/api/health
2. **Test simple** : http://localhost:3001/api/test/lycees
3. **Console du navigateur** pour les erreurs frontend
4. **Logs du backend** dans le terminal

## 🎉 Félicitations !

Votre système de matching lycées-entreprises est maintenant opérationnel ! 

Les entreprises peuvent maintenant trouver facilement des lycées professionnels pour recruter leurs futurs alternants. 🎓✨ 