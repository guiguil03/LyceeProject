# Utiliser Node.js pour le serveur de développement
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances
RUN npm install

# Copier le code source
COPY . .


# Exposer le port 3000 (port par défaut de Next.js)
EXPOSE 3000

# Démarrer le serveur de développement
CMD ["npm", "run", "dev"]