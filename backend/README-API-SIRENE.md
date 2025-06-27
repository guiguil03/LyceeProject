# Configuration API SIRENE avec Clé API

## 🔑 Obtenir une clé API INSEE (GRATUIT)

1. **Aller sur le site INSEE** : https://api.insee.fr/catalogue/
2. **Se connecter/créer un compte**
3. **S'abonner à "API Sirene V3"** (service gratuit)
4. **Récupérer votre Consumer Key** dans votre espace personnel

## ⚙️ Configuration

### Option 1: Variable d'environnement (recommandée)
```bash
# Créer un fichier .env dans le dossier backend/
echo "INSEE_API_KEY=VOTRE_CLE_ICI" > backend/.env
```

### Option 2: Modification directe du code
Dans `backend/src/services/siretService.ts`, ligne 32 :
```typescript
private readonly API_KEY = 'VOTRE_CLE_API_ICI';
```

## 🧪 Test de votre clé API

```bash
# Dans le dossier backend/
npm run test-sirene
```

## 📊 Avantages de l'API avec clé

- ✅ **Plus fiable** que l'API publique
- ✅ **Données complètes** (toutes les entreprises françaises)
- ✅ **Mises à jour en temps réel**
- ✅ **Rate limit élevé** (30 req/min)
- ✅ **Support officiel INSEE**

## 🚀 SIRET de test

Voici quelques SIRET valides pour tester :
- **Apple France** : `42493225600074`
- **Google France** : `44323424600047` 
- **Microsoft France** : `32737946700062`
- **Amazon France** : `48787235700195`

## 📞 Support

En cas de problème avec votre clé API, contactez l'INSEE :
- Documentation : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
- Support : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/help.jag 