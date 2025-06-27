# 🔧 Guide de Dépannage - Système Matching Lycées-Entreprises

## ❌ Problème: "NetworkError when attempting to fetch resource"

### 🔍 Cause
L'API Sirene (entreprise.data.gouv.fr) est temporairement indisponible ou bloquée par votre pare-feu.

### ✅ Solutions

#### 1. Utilisez les SIRETs de démonstration
```
78467169500015  →  TechSolutions Paris (Informatique)
12345678901234  →  CommerceMax SARL (Commerce) 
98765432109876  →  Bâtiment Expert (Bâtiment)
```

#### 2. Testez sans SIRET
- Sélectionnez uniquement un **secteur d'activité**
- Ajoutez une **localisation** (commune, département, code postal)
- Cliquez sur "🔍 Trouver des lycées"

#### 3. Vérifiez les services
```bash
# Test du backend
curl http://localhost:3001/api/health

# Test des lycées
curl http://localhost:3001/api/test/lycees

# Liste des entreprises de démo
curl http://localhost:3001/api/demo/entreprises
```

## 🚀 Mode dégradé (fonctionnement garanti)

### Sans SIRET - Recherche manuelle
1. **Secteur** : Sélectionnez votre secteur d'activité
2. **Localisation** : 
   - Commune: `Paris`
   - Code postal: `75000`
   - Département: `Seine-et-Marne`
3. **Cliquez** sur "🔍 Trouver des lycées"

### Avec géolocalisation
1. Cliquez sur "📍 Utiliser ma position"
2. Autorisez l'accès à votre localisation
3. Sélectionnez votre secteur
4. Lancez la recherche

## 🔍 Diagnostic des problèmes

### Backend ne répond pas
```powershell
# Redémarrer le backend
cd backend
npm run dev
```

### Frontend ne charge pas
```powershell  
# Redémarrer le frontend
cd frontend
npm run dev
```

### API des lycées lente
- **Normal** : L'API officielle peut être lente
- **Patience** : Attendez 10-15 secondes
- **Réessayez** : Si échec, relancez la recherche

## 📊 URLs de test utiles

| Service | URL | Description |
|---------|-----|-------------|
| Health Check | http://localhost:3001/api/health | État général |
| Test Lycées | http://localhost:3001/api/test/lycees | Test API lycées (complet) |
| Test Matching | http://localhost:3001/api/test/matching-simple | Test matching simplifié |
| Entreprises Demo | http://localhost:3001/api/demo/entreprises | Données de démo |
| Liste SIRETs | http://localhost:3001/api/demo/sirets | SIRETs de test |
| Secteurs | http://localhost:3001/api/secteurs | Secteurs supportés |

## 🎯 Test rapide fonctionnel

### Test 1: Recherche par secteur
```
Secteur: Informatique et numérique
Commune: Paris
→ Devrait retourner des lycées parisiens
```

### Test 2: SIRET de démo
```
SIRET: 78467169500015
→ Devrait auto-remplir "TechSolutions Paris"
→ Devrait trouver des lycées informatique près de Paris
```

### Test 3: Sans données entreprise
```
Secteur: Commerce et vente  
Département: Seine-et-Marne
Distance max: 25 km
→ Devrait trouver des lycées commerce en Seine-et-Marne
```

## 🚨 En cas d'urgence

### Redémarrage complet
```powershell
# 1. Arrêter tous les services (Ctrl+C)

# 2. Nettoyer et redémarrer
cd backend
npm install
npm run dev

# 3. Dans un autre terminal
cd frontend  
npm install
npm run dev
```

### Mode développement rapide
```powershell
# Depuis la racine du projet
.\start-dev.ps1
```

## 📞 Vérifications finales

- [ ] Backend fonctionne : http://localhost:3001/api/health
- [ ] Frontend accessible : http://localhost:5173
- [ ] API lycées répond : http://localhost:3001/api/test/lycees
- [ ] Données de démo disponibles : http://localhost:3001/api/demo/sirets

## 💡 Conseils d'utilisation

1. **Commencez simple** : Secteur + commune uniquement
2. **Testez les SIRETs de démo** : Ils fonctionnent toujours
3. **Soyez patient** : Les APIs externes peuvent être lentes
4. **Utilisez la géolocalisation** : Plus précis pour la distance

---

## ✅ L'application fonctionne correctement quand :

- Le backend répond sur http://localhost:3001/api/health
- Les SIRETs de démo retournent des résultats
- La recherche par secteur trouve des lycées
- La géolocalisation fonctionne (optionnel)

**Votre système est robuste et fonctionnel même en cas de panne des APIs externes !** 🎉 