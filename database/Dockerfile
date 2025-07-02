# Utiliser l'image officielle PostgreSQL
FROM postgres:15-alpine

# Variables d'environnement
ENV POSTGRES_DB=lyceeproject
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password

# Copier les scripts d'initialisation
COPY init.sql/* /docker-entrypoint-initdb.d/

# Exposer le port standard PostgreSQL
EXPOSE 5432

# Le point d'entrée est défini par l'image de base 