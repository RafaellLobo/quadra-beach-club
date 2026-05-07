from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_jwt, UserContext
from database import get_user_db

app = FastAPI(title="Quadra Beach Club API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "quadra-api"}

@app.get("/me")
def get_my_context(user: UserContext = Depends(verify_jwt)):
    return {
        "message": "Você está autenticado.",
        "user_id": user.user_id,
        "role": user.role
    }

@app.get("/turmas")
def listar_turmas(user: UserContext = Depends(verify_jwt)):
    """
    Busca todas as turmas. 
    Graças ao get_user_db e ao RLS no banco, o Supabase filtrará automaticamente
    apenas as turmas pertencentes à arena vinculada a este usuário.
    """
    try:
        # 1. Instancia o cliente do banco com a identidade do usuário
        supabase = get_user_db(user.token)
        
        # 2. Executa a query
        response = supabase.table("turmas").select("*").execute()
        
        # 3. Retorna os dados puros (o FastAPI converte em JSON automaticamente)
        return response.data
        
    except Exception as e:
        # Catch genérico para capturar erros de sintaxe ou de permissão do banco
        raise HTTPException(status_code=400, detail=f"Erro ao buscar turmas: {str(e)}")