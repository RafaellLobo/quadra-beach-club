from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from auth import UserContext, verify_jwt
from database import get_user_db
from schemas.turmas import TurmaResponse

app = FastAPI(title="Quadra Beach Club API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "quadra-api"}


@app.get("/me")
def get_my_context(user: UserContext = Depends(verify_jwt)) -> dict[str, str]:
    return {
        "message": "Você está autenticado.",
        "user_id": user.user_id,
        "role": user.role,
    }


@app.get("/turmas", response_model=list[TurmaResponse])
def listar_turmas(user: UserContext = Depends(verify_jwt)) -> list[TurmaResponse]:
    """
    Lista turmas visíveis ao usuário autenticado.

    O isolamento multi-tenant continua sendo responsabilidade do RLS no PostgreSQL.
    A seleção explícita de colunas evita vazamento acidental de campos internos.
    """
    try:
        supabase = get_user_db(user.token)

        response = (
            supabase.table("turmas")
            .select("id,arena_id,professor_id,valor_mensalidade")
            .execute()
        )

        return [TurmaResponse(**turma) for turma in response.data]

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Erro ao buscar turmas.",
        ) from exc