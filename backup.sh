#!/bin/bash

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
SOURCE_DIR="/var/www/intelligence"

# Crea directory per questo backup
mkdir -p "backup_$DATE"

# Copia solo file di codice sicuri
echo "Copiando file Python..."
find "$SOURCE_DIR" -name "*.py" -not -path "*/venv/*" -not -path "*/.venv/*" \
  -not -name "config.py" -not -path "*/rag_system_recovery_complete.sh" \
  -exec cp --parents {} "backup_$DATE/" \; 2>/dev/null

echo "Copiando file JavaScript/TypeScript..."
find "$SOURCE_DIR" -name "*.js" -o -name "*.ts" -o -name "*.tsx" | \
  grep -v node_modules | \
  xargs -I {} cp --parents {} "backup_$DATE/" 2>/dev/null

echo "Copiando file JSON e MD..."
find "$SOURCE_DIR" -name "*.json" -o -name "*.md" | \
  grep -v node_modules | \
  xargs -I {} cp --parents {} "backup_$DATE/" 2>/dev/null

echo "File copiati:"
find "backup_$DATE/" -type f | wc -l

# Verifica che ci siano file da committare
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "Backup pulito del $DATE"
    git push origin main
    echo "Backup completato: backup_$DATE"
else
    echo "Nessun file nuovo da backuppare"
    rmdir "backup_$DATE" 2>/dev/null
fi
