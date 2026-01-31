#!/bin/bash
set -e

# Avvia Nginx in background
nginx -g 'daemon off;' &
NGINX_PID=$!

# Avvia l'applicazione FastAPI
cd /app/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
APP_PID=$!

# Funzione per gestire lo shutdown
shutdown() {
    echo "Shutting down..."
    kill -s TERM $NGINX_PID
    kill -s TERM $APP_PID
    wait $NGINX_PID
    wait $APP_PID
    exit 0
}

# Trap segnali
trap shutdown SIGTERM SIGINT

# Attendi che i processi finiscano
wait $NGINX_PID $APP_PID
