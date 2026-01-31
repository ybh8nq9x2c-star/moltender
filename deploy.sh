#!/bin/bash

# ============================================
# 🚀 Moltender - Script di Deployment Automatico
# ============================================

set -e

echo "🚀 Inizio deployment di Moltender..."

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verifica prerequisiti
echo "\n📋 Verifica prerequisiti..."
if command -v docker &> /dev/null; then
    print_success "Docker è già installato"
else
    print_warning "Docker non è installato. Installazione in corso..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    print_success "Docker installato"
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    print_success "Docker Compose è già installato"
else
    print_warning "Docker Compose non è installato. Installazione in corso..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installato"
fi

# 2. Crea directory necessarie
echo "\n📁 Creazione directory..."
mkdir -p logs backup
print_success "Directory create"

# 3. Ferma container esistenti
echo "\n🛑 Ferma container esistenti..."
docker-compose down 2>/dev/null || true
print_success "Container fermati"

# 4. Build e avvia container
echo "\n🔨 Build dell'immagine..."
docker-compose build --no-cache
print_success "Build completato"

echo "\n🚀 Avvio dei container..."
docker-compose up -d
print_success "Container avviati"

# 5. Attendi che i servizi siano pronti
echo "\n⏳ Attendo che i servizi siano pronti..."
sleep 10

# 6. Verifica health check
echo "\n🏥 Verifica health check..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health &> /dev/null; then
        print_success "Health check passato!"
        break
    fi
    echo "Tentativo $i/30..."
    sleep 2
done

# 7. Mostra stato
echo "\n📊 Stato dei container:"
docker-compose ps

# 8. Mostra log
echo "\n📋 Log recenti:"
docker-compose logs --tail=20 moltender

# 9. Informazioni di accesso
echo "\n"
echo "============================================"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETATO!${NC}"
echo "============================================"
echo ""
echo "🌐 Accesso all'applicazione:"
echo "   Frontend:     http://localhost:80"
echo "   API:          http://localhost:8000"
echo "   Swagger Docs: http://localhost:8000/docs"
echo "   Observer:     http://localhost:8000/observer"
echo ""
echo "📊 Comandi utili:"
echo "   Vedi log:     docker-compose logs -f"
echo "   Ferma:        docker-compose stop"
echo "   Riavvia:      docker-compose restart"
echo "   Stop:         docker-compose down"
echo ""
echo "============================================"
