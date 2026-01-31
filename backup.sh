#!/bin/bash

# ============================================
# 💾 Moltender - Script di Backup Automatico
# ============================================

set -e

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Directory backup
BACKUP_DIR="/root/moltender/backup"
DB_PATH="/root/moltender/backend/moltender.db"

# Crea directory backup se non esiste
mkdir -p "$BACKUP_DIR"

# Nome file backup con timestamp
BACKUP_FILE="$BACKUP_DIR/moltender_$(date +%Y%m%d_%H%M%S).db"

# Copia database
echo "💾 Creazione backup..."
cp "$DB_PATH" "$BACKUP_FILE"

# Comprimi backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo -e "${GREEN}✅ Backup creato: $BACKUP_FILE${NC}"

# Mantieni solo gli ultimi 7 backup
echo "🧹 Pulizia vecchi backup..."
ls -t "$BACKUP_DIR"/moltender_*.db.gz | tail -n +8 | xargs rm -f

echo -e "${GREEN}✅ Pulizia completata${NC}"

# Mostra spazio utilizzato
echo "\n📊 Spazio utilizzato:"
du -sh "$BACKUP_DIR"

echo "\n💾 Backup completato con successo!"
