#!/bin/bash

# Logo Magic Remover - Launcher (macOS)

echo "=========================================="
echo "    Logo Magic Remover v3.0 Ultra"
echo "       Iniciando Sistema (macOS)"
echo "=========================================="

# 1. Configurar Backend
echo "[1/2] Preparando Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Instalando dependencias..."
pip install -r requirements.txt
cd ..

# 2. Configurar Frontend
echo "[2/2] Preparando Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias do Node..."
    npm install
fi
cd ..

# Iniciar ambos em novas abas do Terminal usando AppleScript
echo "Lançando servidores em novas janelas..."

# Lançar Backend
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"'

# Lançar Frontend
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/frontend && npm run dev"'

echo "=========================================="
echo "    TUDO PRONTO!"
echo "    Frontend: http://localhost:5173"
echo "    Backend:  http://localhost:8000"
echo "=========================================="
