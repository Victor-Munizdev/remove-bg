@echo off
TITLE Logo Magic Remover - Launcher
echo.
echo ==========================================
echo     Logo Magic Remover v3.0 Ultra
echo       Iniciando Sistema (Windows)
echo ==========================================
echo.

:: 1. Iniciar Backend
echo [1/2] Configurando Backend Python...
cd backend
if not exist venv (
    echo Criando ambiente virtual...
    python -m venv venv
)
call venv\Scripts\activate
echo Instalando dependencias do Backend...
pip install -r requirements.txt
echo Iniciar servidor Backend em uma nova janela...
start "Logo Magic - BACKEND" cmd /k "call venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo.
:: 2. Iniciar Frontend
echo [2/2] Configurando Frontend React...
cd frontend
if not exist node_modules (
    echo Instalando dependencias do Frontend (isso pode demorar na primeira vez)...
    call npm install
)
echo Iniciar servidor Frontend em uma nova janela...
start "Logo Magic - FRONTEND" cmd /k "npm run dev"
cd ..

echo.
echo ==========================================
echo    TUDO PRONTO!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo ==========================================
echo.
pause
