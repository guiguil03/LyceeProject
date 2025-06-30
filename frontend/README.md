# LyceeProject - Frontend Next.js

Ce projet est la version Next.js du frontend LyceeProject, migrée depuis React/Vite.

## 🚀 Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **ESLint** - Linting et qualité de code

## 📁 Structure du projet

```
src/
├── app/                # Pages avec App Router
│   ├── layout.tsx     # Layout principal
│   ├── page.tsx       # Page d'accueil
│   ├── search/        # Page de recherche
│   ├── lycee/         # Page du lycée
│   └── chat/          # Page de chat
├── components/        # Composants réutilisables
│   ├── Navbar.tsx     # Navigation principale
│   └── MatchingLycees.tsx
├── services/          # Services API
│   └── api.ts         # Appels backend
└── types/             # Types TypeScript
    └── api.ts         # Types API
```

## 🛠️ Installation et lancement

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Lancement en développement**
   ```bash
   npm run dev
   ```

3. **Build de production**
   ```bash
   npm run build
   npm start
   ```

## 🔗 Connexion avec le backend

Le frontend se connecte automatiquement au backend Node.js sur `http://localhost:3001`.

Assurez-vous que le backend est démarré avant d'utiliser les fonctionnalités de recherche.

## 📄 Pages disponibles

- **Accueil** (`/`) - Présentation du projet
- **Recherche** (`/search`) - Recherche de lycées avec critères
- **Mon Lycée** (`/lycee`) - Présentation détaillée du Lycée Henri Senez
- **Chat** (`/chat`) - Assistant virtuel pour accompagner les utilisateurs

## 🎨 Fonctionnalités

### Navigation
- Navbar responsive avec logo et navigation par onglets
- Design moderne avec Tailwind CSS
- Navigation adaptée pour Next.js (next/navigation)

### Pages
1. **Page d'accueil** - Introduction du projet avec design épuré
2. **Page de recherche** - Formulaire avancé pour rechercher des lycées
3. **Page lycée** - Reproduction fidèle du design gouvernemental "Je valorise mon lycée"
4. **Page chat** - Interface de discussion avec assistant virtuel

### Composants
- **MatchingLycees** - Composant de recherche avec critères avancés
- **Navbar** - Navigation principale avec onglets interactifs

## 📱 Responsive Design

Toutes les pages sont optimisées pour mobile, tablette et desktop grâce à Tailwind CSS.

## 🔄 Migration depuis React/Vite

Cette version Next.js reprend toutes les fonctionnalités de la version React/Vite :

- ✅ Navigation par onglets
- ✅ Page d'accueil
- ✅ Recherche de lycées
- ✅ Page de présentation du lycée
- ✅ Chat assistant
- ✅ Design gouvernemental
- ✅ Responsive design

## 🌐 Variables d'environnement

Créez un fichier `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
