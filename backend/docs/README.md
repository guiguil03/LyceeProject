# Documentation API LyceeProject

## 📖 Aperçu

Cette documentation Swagger/OpenAPI décrit complètement l'API REST de LyceeProject, une plateforme de mise en relation entre lycées professionnels et entreprises.

## 🚀 Utilisation de la documentation

### Visualisation locale

Pour visualiser la documentation Swagger localement :

1. **Avec Swagger UI en ligne** :
   - Allez sur [https://editor.swagger.io/](https://editor.swagger.io/)
   - Copiez le contenu du fichier `../swagger.yaml`
   - Collez-le dans l'éditeur

2. **Avec Swagger UI local** :
   ```bash
   # Installation de Swagger UI
   npm install -g swagger-ui-serve
   
   # Servir la documentation
   swagger-ui-serve ../swagger.yaml
   ```

3. **Avec Docker** :
   ```bash
   docker run -p 8080:8080 -e SWAGGER_JSON=/docs/swagger.yaml -v $(pwd)/../swagger.yaml:/docs/swagger.yaml swaggerapi/swagger-ui
   ```

### Test des endpoints

La documentation Swagger permet de :

- **Explorer** tous les endpoints disponibles
- **Tester** directement les API depuis l'interface
- **Voir** les exemples de requêtes/réponses
- **Comprendre** les modèles de données

## 🔐 Authentification

### Configuration du token

1. Connectez-vous via `POST /auth/login`
2. Récupérez le token JWT dans la réponse
3. Dans Swagger UI, cliquez sur "Authorize" 
4. Entrez : `Bearer <votre-token>`

### Exemple de token
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ0eXBlIjoiZW50cmVwcmlzZSIsImlhdCI6MTcwNjEwMDAwMCwiZXhwIjoxNzA2MTg2NDAwfQ.signature
```

## 📚 Structure de l'API

### Modules principaux

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Authentification** | Connexion, inscription, profils | `/auth/*` |
| **Demandes** | Gestion des demandes de partenariat | `/demandes/*` |
| **Lycées** | Recherche et profils des lycées | `/lycees/*` |
| **Entreprises** | Recherche et profils des entreprises | `/entreprises/*` |
| **Matching** | Algorithmes de mise en relation | `/matching`, `/match/*` |
| **Statistiques** | Rapports et analytics | `/stats/*` |
| **Référentiel** | Données de base (régions, domaines...) | `/regions`, `/domaines`, `/metiers` |
| **Synchronisation** | Sync avec sources externes | `/sync/*` |

### Codes de statut

| Code | Signification | Usage |
|------|---------------|--------|
| `200` | Succès | Opération réussie |
| `201` | Créé | Ressource créée avec succès |
| `400` | Requête invalide | Données manquantes ou incorrectes |
| `401` | Non autorisé | Token manquant ou invalide |
| `403` | Interdit | Permissions insuffisantes |
| `404` | Non trouvé | Ressource inexistante |
| `500` | Erreur serveur | Erreur interne |

## 🎯 Exemples d'utilisation

### 1. Connexion entreprise

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contact@entreprise.fr",
    "password": "motdepasse123"
  }'
```

### 2. Création d'une demande

```bash
curl -X POST http://localhost:3001/api/demandes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "entreprise_id": "12345678901234",
    "titre": "Stage développement web",
    "description": "Recherche stagiaires en développement",
    "type_partenariat": "STAGE",
    "zone_geo": "Île-de-France",
    "nb_places": 3
  }'
```

### 3. Recherche de lycées

```bash
curl -X GET "http://localhost:3001/api/lycees/search?commune=Paris&search=informatique" \
  -H "Authorization: Bearer <token>"
```

### 4. Matching automatique

```bash
curl -X POST http://localhost:3001/api/matching \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "siret": "12345678901234",
    "secteur_activite": "Informatique",
    "zone_geo": "Île-de-France",
    "max_distance": 50
  }'
```

## 🔄 Workflows typiques

### Workflow Entreprise

1. **Inscription** → `POST /auth/register/entreprise`
2. **Connexion** → `POST /auth/login`
3. **Recherche lycées** → `GET /lycees/search`
4. **Création demande** → `POST /demandes`
5. **Suivi demande** → `GET /demandes/{id}`

### Workflow Lycée (RBDE)

1. **Inscription** → `POST /auth/register/lycee`
2. **Connexion** → `POST /auth/login`
3. **Consultation demandes** → `GET /demandes`
4. **Traitement demande** → `PUT /demandes/{id}`
5. **Historique actions** → `GET /demandes/{id}/actions`

## 📊 Monitoring et Debug

### Vérification de santé

```bash
curl http://localhost:3001/api/health
```

### Endpoints de test

- `GET /test/lycees` - Test du service lycées
- `GET /debug/lycees` - Debug des données lycées
- `GET /demo/entreprises` - Données de démonstration

## 🛠 Développement

### Mise à jour de la documentation

1. Modifiez le fichier `swagger.yaml`
2. Validez la syntaxe sur [https://editor.swagger.io/](https://editor.swagger.io/)
3. Committez les changements

### Génération de clients

La documentation peut être utilisée pour générer des clients automatiquement :

```bash
# Client JavaScript
swagger-codegen generate -i swagger.yaml -l javascript -o ./client-js

# Client Python
swagger-codegen generate -i swagger.yaml -l python -o ./client-python

# Client PHP
swagger-codegen generate -i swagger.yaml -l php -o ./client-php
```

## 📞 Support

- **Email** : support@lyceeproject.fr
- **Issues** : Créez une issue GitHub
- **Documentation** : Consultez le README principal du projet

## 📋 Versions

| Version | Date | Changements |
|---------|------|-------------|
| 1.0.0 | 2024-01 | Version initiale complète |

---

*Cette documentation est générée automatiquement à partir du schéma OpenAPI 3.0.3* 