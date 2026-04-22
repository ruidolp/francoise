#!/bin/bash
# Ejecuta todas las migraciones en orden
# Uso: ./db/migrate.sh [DATABASE_URL]

DB_URL="${1:-postgresql://postgres@localhost/francoise}"

for file in "$(dirname "$0")/migrations"/*.sql; do
  echo "Aplicando: $file"
  psql "$DB_URL" -f "$file"
done

echo "Migraciones completadas."
