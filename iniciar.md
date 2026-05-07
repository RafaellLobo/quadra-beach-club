Terminal 1 — Backend
cd /c/beach_system/quadra-api
source .venv/Scripts/activate
python -m uvicorn main:app --reload

Terminal 2 — Frontend
cd /c/beach_system/quadra-front
npm run dev

Navegador
http://localhost:5173
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/health
