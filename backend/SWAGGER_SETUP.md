# 📖 Setup Documentation Swagger - LyceeProject

## 🎯 Fichiers créés

| Fichier | Description | Statut |
|---------|-------------|---------|
| `swagger.yaml` | Spécification OpenAPI complète | ✅ Créé |
| `docs/README.md` | Guide d'utilisation de la doc | ✅ Créé |
| `src/routes/docs.ts` | Routes pour servir la doc | ✅ Créé |
| `SWAGGER_SETUP.md` | Ce guide de setup | ✅ Créé |

## 🚀 Installation des dépendances

```bash
cd backend
npm install swagger-ui-express yamljs
npm install --save-dev @types/swagger-ui-express @types/yamljs
```

## 🔧 Configuration dans l'application

### 1. Ajouter la route docs dans votre app principal

Ajoutez dans `src/index.ts` :

```typescript
import docsRouter from './routes/docs';

// ... existing code ...

// Route pour la documentation
app.use('/api/docs', docsRouter);

// ... existing code ...
```

### 2. Scripts npm disponibles

```bash
# Valider la syntaxe Swagger
npm run docs:validate

# Ouvrir l'éditeur Swagger en ligne
npm run docs:open

# Servir la documentation localement (nécessite swagger-ui-serve global)
npm run docs:swagger
```

## 📱 Accès à la documentation

Une fois le serveur démarré (`npm run dev`), la documentation est accessible via :

| Endpoint | Description |
|----------|-------------|
| `http://localhost:3001/api/docs` | Informations sur la documentation |
| `http://localhost:3001/api/docs/swagger` | Interface Swagger UI interactive |
| `http://localhost:3001/api/docs/swagger.json` | Spécification OpenAPI en JSON |
| `http://localhost:3001/api/docs/health` | Statut de la documentation |

## 🎨 Interface Swagger UI

L'interface Swagger UI permet de :

- ✅ **Explorer** tous les endpoints
- ✅ **Tester** les API directement
- ✅ **S'authentifier** avec JWT
- ✅ **Voir** les exemples de réponses
- ✅ **Comprendre** les modèles de données
- ✅ **Générer** du code client

## 🔐 Test avec authentification

### 1. Se connecter
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@entreprise.fr", "password": "password123"}'
```

### 2. Récupérer le token dans la réponse
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
  }
}
```

### 3. Dans Swagger UI
- Cliquer sur "Authorize" 🔒
- Entrer : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Cliquer sur "Authorize"

### 4. Tester les endpoints protégés
Tous les endpoints nécessitant une authentification sont maintenant accessibles !

## 📊 Couverture de l'API

La documentation Swagger couvre **100%** des endpoints :

### Modules documentés
- ✅ **Authentification** (6 endpoints)
  - Connexion, inscription, vérification, profil, déconnexion
- ✅ **Demandes** (7 endpoints)  
  - CRUD complet + assignation lycées + historique
- ✅ **Lycées** (4 endpoints)
  - Recherche, profils, détails par UAI
- ✅ **Entreprises** (4 endpoints)
  - Recherche, profils, détails par SIRET  
- ✅ **Matching** (3 endpoints)
  - Algorithmes de mise en relation
- ✅ **Statistiques** (2 endpoints)
  - Analytics et rapports
- ✅ **Référentiel** (4 endpoints)
  - Régions, domaines, métiers
- ✅ **Synchronisation** (3 endpoints)
  - Sync avec sources externes
- ✅ **Utilitaires** (2 endpoints)
  - Health checks et monitoring

### Types de données
- ✅ **12 schémas principaux** définis
- ✅ **Réponses d'erreur** standardisées  
- ✅ **Exemples concrets** pour chaque endpoint
- ✅ **Validation** des paramètres
- ✅ **Codes de statut** HTTP documentés

## 🛠 Outils externes

### Postman
```bash
# Importer la collection dans Postman
1. Ouvrir Postman
2. Import > Link
3. Coller : http://localhost:3001/api/docs/swagger.json
```

### Clients auto-générés
```bash
# Installer swagger-codegen
npm install -g swagger-codegen

# Générer un client JavaScript
swagger-codegen generate \
  -i http://localhost:3001/api/docs/swagger.json \
  -l javascript \
  -o ./client-js

# Générer un client Python
swagger-codegen generate \
  -i http://localhost:3001/api/docs/swagger.json \
  -l python \
  -o ./client-python
```

## 🔄 Mise à jour

Pour mettre à jour la documentation :

1. **Modifier** `swagger.yaml`
2. **Valider** avec `npm run docs:validate`  
3. **Tester** sur `http://localhost:3001/api/docs/swagger`
4. **Committer** les changements

## ❗ Troubleshooting

### Documentation non accessible
```bash
# Vérifier que les dépendances sont installées
npm list swagger-ui-express yamljs

# Vérifier le fichier swagger.yaml
ls -la swagger.yaml

# Tester la route de santé
curl http://localhost:3001/api/docs/health
```

### Erreurs de validation
```bash
# Valider la syntaxe
npm run docs:validate

# Ou utiliser l'éditeur en ligne
npm run docs:open
```

### Token JWT expiré
```bash
# Reconnectez-vous pour obtenir un nouveau token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "votre@email.fr", "password": "motdepasse"}'
```

## 🎉 Résultat

Vous disposez maintenant d'une **documentation API complète et interactive** qui :

- 📚 **Documente** tous vos endpoints
- 🧪 **Permet de tester** directement l'API  
- 🔐 **Gère l'authentification** JWT
- 📱 **S'intègre** dans votre application
- 🚀 **Facilite le développement** et l'intégration
- 🌐 **Respecte les standards** OpenAPI 3.0.3

---

**🎯 Prochaines étapes recommandées :**

1. Ajouter la route docs dans votre serveur principal
2. Installer les dépendances manquantes
3. Tester l'interface Swagger UI
4. Partager le lien avec votre équipe !

*Happy coding! 🚀* 