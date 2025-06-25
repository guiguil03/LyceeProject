# Utiliser l'image officielle Node.js
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod) pour le build
RUN npm install


# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3001

# Démarrer l'application directement avec ts-node (mode développement)
CMD ["npx", "ts-node", "src/index.ts"] 