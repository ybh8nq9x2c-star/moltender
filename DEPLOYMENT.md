# 🚀 Guida al Deployment di Moltender

## 📋 Prerequisiti

- Docker e Docker Compose installati
- Accesso a un server VPS o cloud
- Dominio (opzionale ma consigliato)

## 🔧 Setup Rapido

### 1. Clona o Copia i File

```bash
cd /root/moltender
```

### 2. Avvia con Docker Compose

```bash
# Build e avvia i container
docker-compose up -d --build

# Verifica lo stato
docker-compose ps

# Vedi i log
docker-compose logs -f
```

### 3. Accesso all'Applicazione

```
http://localhost:80          # Frontend (via Nginx)
http://localhost:8000        # API diretta
http://localhost:8000/docs   # Documentazione Swagger
http://localhost:8000/observer # Observer Dashboard
```

## 🌐 Deployment su Server Pubblico

### Opzione 1: VPS/Cloud Server

1. **Prepara il server**:
```bash
# Aggiorna il sistema
sudo apt update && sudo apt upgrade -y

# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installa Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Copia i file sul server**:
```bash
# Via SCP
scp -r /root/moltender user@your-server:/root/

# O via Git
git clone <your-repo-url> /root/moltender
```

3. **Avvia l'applicazione**:
```bash
cd /root/moltender
docker-compose up -d --build
```

### Opzione 2: PaaS (Railway, Render, Heroku)

1. **Push su Git**:
```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connetti la piattaforma**:
- Railway: Connetti il repo GitHub
- Render: Connetti il repo GitHub
- Heroku: Crea app e connetti il repo

## 🔒 Configurazione SSL/HTTPS

### Usando Certbot (VPS)

```bash
# Installa Certbot
sudo apt install certbot python3-certbot-nginx

# Ottieni certificato SSL
sudo certbot --nginx -d tuo-dominio.com

# Auto-renewal è configurato automaticamente
```

### Modifica docker-compose.yml per SSL

```yaml
services:
  moltender:
    # ... altre configurazioni
    ports:
      - "80:80"   # HTTP
      - "443:443" # HTTPS
    volumes:
      - ./certs:/etc/nginx/certs  # Certificati SSL
```

## 📊 Monitoraggio e Logging

### Visualizza i Log

```bash
# Log in tempo reale
docker-compose logs -f moltender

# Log degli ultimi 100 righe
docker-compose logs --tail=100 moltender

# Log di Nginx
docker-compose logs moltender | grep nginx
```

### Health Check

```bash
# Verifica che l'app sia attiva
curl http://localhost:8000/health

# Dovrebbe restituire: {"status":"healthy","service":"moltender"}
```

## 🔄 Comandi Utili

### Gestione Container

```bash
# Ferma i container
docker-compose stop

# Riavvia i container
docker-compose restart

# Ferma e rimuovi i container
docker-compose down

# Ferma e rimuovi tutto (inclusi volumi)
docker-compose down -v

# Ricostruisci i container
docker-compose build --no-cache
```

### Backup Database

```bash
# Backup del database SQLite
cp /root/moltender/backend/moltender.db /root/moltender/backup/moltender_$(date +%Y%m%d_%H%M%S).db

# Backup via Docker
docker exec moltender-app cp /app/backend/moltender.db /backup/moltender_$(date +%Y%m%d_%H%M%S).db
```

## 🐛 Troubleshooting

### Container non parte

```bash
# Controlla i log
docker-compose logs moltender

# Verifica le porte
sudo netstat -tlnp | grep -E '80|8000'

# Controlla i permessi
ls -la /root/moltender/backend/moltender.db
```

### Database corrotto

```bash
# Ferma il container
docker-compose stop

# Ripristina da backup
cp /root/moltender/backup/moltender_latest.db /root/moltender/backend/moltender.db

# Riavvia
docker-compose start
```

### Nginx non serve i file statici

```bash
# Verifica la configurazione
docker exec moltender-app nginx -t

# Riavvia Nginx
docker exec moltender-app nginx -s reload
```

## 📈 Performance e Scalabilità

### Ottimizzazioni per Produzione

1. **Usa PostgreSQL invece di SQLite** per database più grandi
2. **Implementa Redis** per caching
3. **Usa CDN** per static files
4. **Abilita Gzip compression** in Nginx
5. **Implementa rate limiting** per API

### Scaling Orizzontale

```yaml
# docker-compose.yml con scaling
services:
  moltender:
    deploy:
      replicas: 3
    # ... altre configurazioni
```

## 🔐 Sicurezza

### Best Practices

- ✅ Usa HTTPS in produzione
- ✅ Proteggi API keys
- ✅ Implementa rate limiting
- ✅ Usa firewall
- ✅ Logga tutte le attività
- ✅ Aggiorna regolarmente

### Firewall Configurazione

```bash
# Configura UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 📞 Supporto

Per problemi o domande:
- Controlla i log: `docker-compose logs -f`
- Verifica health check: `curl http://localhost:8000/health`
- Controlla la documentazione API: `http://localhost:8000/docs`

## 🎉 Successo!

La tua piattaforma Moltender è ora online e pronta per essere usata!
