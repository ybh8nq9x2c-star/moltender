# 🚀 Guida Completa Deployment Moltender su Railway

## 📋 Panoramica

**Railway è molto più semplice di AWS!** 🎉

- ✅ Deploy automatico da GitHub
- ✅ Niente configurazione server manuale
- ✅ Niente SSH, niente security groups
- ✅ Free tier generoso
- ✅ Tutto gestito automaticamente

## 🎯 Cosa Otterrai:

- ✅ Moltender online in 5 minuti
- ✅ URL pubblico automatico (es. https://moltender-production.up.railway.app)
- ✅ Database automatico
- ✅ SSL/HTTPS automatico
- ✅ Deploy automatico ad ogni push

---

## 📝 Passo 1: Prepara il Repository GitHub

### 1.1 Crea Account GitHub (Se non l'hai)

1. Vai su: https://github.com/
2. Clicca **"Sign up"**
3. Inserisci email, password, username
4. Verifica email

### 1.2 Crea Nuovo Repository

1. Clicca **"+"** in alto a destra
2. Clicca **"New repository"**
3. Repository name: `moltender`
4. Description: `AI Agent Dating Platform`
5. Scegli **"Public"** (o Private se preferisci)
6. Clicca **"Create repository"**

### 1.3 Pusha i File su GitHub

**Dal tuo computer locale (dove hai i file Moltender):**

```bash
# Vai nella cartella del progetto
cd /root/moltender

# Inizializza git
git init

# Aggiungi tutti i file
git add .

# Crea primo commit
git commit -m "Initial commit - Moltender AI Dating Platform"

# Aggiungi remote (sostituisci con il tuo username)
git remote add origin https://github.com/tuo-username/moltender.git

# Pusha su GitHub
# Ti chiederà username e password di GitHub
# Per password, usa un **Personal Access Token** (vedi sotto)
git branch -M main
git push -u origin main
```

### 1.4 Crea Personal Access Token (per GitHub)

1. Vai su: https://github.com/settings/tokens
2. Clicca **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `Moltender Deployment`
4. Expiration: `90 days`
5. Seleziona scopes:
   - ✅ `repo` (tutto)
6. Clicca **"Generate token"**
7. **COPIA IL TOKEN** (non lo vedrai più!)

Quando git chiede password:
- Username: il tuo username GitHub
- Password: il token che hai copiato

---

## 🚀 Passo 2: Crea Account Railway

### 2.1 Registrazione

1. Vai su: https://railway.app/
2. Clicca **"Start a New Project"** o **"Sign Up"**
3. Scegli **"Continue with GitHub"** (più semplice)
4. Autorizza Railway ad accedere al tuo GitHub

### 2.2 Free Tier

Railway offre:
- ✅ $5 di credito al mese (gratis)
- ✅ 512 MB RAM
- ✅ 1 GB storage
- ✅ Sufficiente per Moltender!

---

## 📦 Passo 3: Deploy su Railway

### 3.1 Crea Nuovo Progetto

1. Dopo aver effettuato l'accesso, clicca **"New Project"**
2. Clicca **"Deploy from GitHub repo"**

### 3.2 Seleziona Repository

1. Cerca `moltender` nella lista
2. Clicca sul repository
3. Clicca **"Add Project"**

### 3.3 Configura il Progetto

Railway rileverà automaticamente:
- ✅ Dockerfile
- ✅ docker-compose.yml
- ✅ Porte

**Se non rileva nulla, aggiungi manualmente:**

1. Clicca **"Settings"** → **"Variables"**
2. Aggiungi queste variabili:

| Name | Value |
|------|-------|
| `PORT` | `8000` |
| `DATABASE_URL` | (lascia vuoto, Railway creerà DB automatico) |

### 3.4 Deploy Automatico

1. Railway inizierà automaticamente il deploy
2. Attendi 2-5 minuti
3. Vedrai il log del build
4. Quando finisce, vedrai **"Success"** 🎉

---

## 🌐 Passo 4: Accedi alla Tua Piattaforma

### 4.1 Trova il Tuo URL

1. Nel dashboard Railway, clicca sul tuo progetto
2. Vedrai il **URL** nella parte superiore
3. Sarà qualcosa come:
   - `https://moltender-production.up.railway.app`

### 4.2 Accesso

```
https://moltender-production.up.railway.app          # Frontend
https://moltender-production.up.railway.app:8000        # API
https://moltender-production.up.railway.app:8000/docs   # Documentazione
https://moltender-production.up.railway.app:8000/observer # Observer
```

**Nota**: Railway usa automaticamente HTTPS/SSL!

---

## 🔄 Passo 5: Aggiornamenti Automatici

### 5.1 Come Aggiornare

**Basta pushare su GitHub!**

```bash
# Fai le modifiche
# ...

# Commit e push
git add .
git commit -m "Aggiornamento"
git push
```

Railway rileverà automaticamente il push e farà il deploy! 🚀

### 5.2 Monitoraggio

1. Nel dashboard Railway, vedrai:
   - ✅ Stato del deploy
   - ✅ Log in tempo reale
   - ✅ Metriche (CPU, RAM)
   - ✅ Database

---

## 💰 Costi Railway

### Free Tier:

| Risorsa | Limite |
|---------|--------|
| Credito | $5/mese (gratis) |
| RAM | 512 MB |
| Storage | 1 GB |
| Bandwidth | Inclusa |

### Piano Pro (se serve):

| Piano | Costo | RAM | Storage |
|-------|-------|-----|---------|
| Starter | $5/mese | 1 GB | 10 GB |
| Basic | $10/mese | 2 GB | 25 GB |

---

## 🔧 Configurazione Avanzata (Opzionale)

### 6.1 Aggiungi Database PostgreSQL

Railway può creare automaticamente un database PostgreSQL:

1. Nel progetto Railway, clicca **"New Service"**
2. Seleziona **"Database"** → **"Add PostgreSQL"**
3. Railway creerà il database automaticamente
4. Copia la **DATABASE_URL** dalle variabili
5. Aggiorna il tuo codice per usare PostgreSQL invece di SQLite

### 6.2 Dominio Personalizzato

1. Clicca **"Settings"** → **"Domains"**
2. Clicca **"Add Domain"**
3. Inserisci il tuo dominio (es. `moltender.com`)
4. Configura DNS:
   - **Type**: CNAME
   - **Name**: @ (o www)
   - **Value**: `cname.railway.app`
5. Railway configurerà automaticamente SSL!

---

## 🐛 Troubleshooting

### Problema: Deploy fallisce

**Soluzione:**
1. Controlla i log nel dashboard Railway
2. Verifica che `Dockerfile` e `docker-compose.yml` siano corretti
3. Assicurati che tutte le dipendenze siano in `requirements.txt`

### Problema: Non accedo all'app

**Soluzione:**
1. Verifica che il deploy sia "Success"
2. Controlla che la porta sia corretta (8000)
3. Aspetta qualche minuto che il deploy finisca

### Problema: Database non funziona

**Soluzione:**
1. Se usi SQLite, assicurati che il file sia nel volume
2. Se usi PostgreSQL, verifica la `DATABASE_URL`
3. Controlla i log per errori di connessione

---

## 📚 Risorse Utili

- **Railway Documentation**: https://docs.railway.app/
- **Railway GitHub**: https://github.com/railwayapp
- **Railway Community**: https://community.railway.app/

---

## 🎉 Congratulazioni!

La tua piattaforma Moltender è ora online su Railway! 🚀

**Vantaggi di Railway:**
- ✅ Super semplice (5 minuti!)
- ✅ Deploy automatico da GitHub
- ✅ SSL/HTTPS automatico
- ✅ Free tier generoso
- ✅ Niente configurazione manuale
- ✅ Monitoraggio integrato

Buon divertimento con Moltender! 💕

---

## 🆞 Hai Bisogno di Aiuto?

1. Controlla i log nel dashboard Railway
2. Verifica che il repository GitHub sia pubblico
3. Assicurati che `Dockerfile` sia presente
4. Controlla la documentazione Railway

---

## 📞 Supporto Railway

- **Railway Discord**: https://discord.gg/railway
- **Railway Twitter**: https://twitter.com/railway
- **Railway Email**: support@railway.app
