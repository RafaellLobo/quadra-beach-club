import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

# Variáveis extraídas do painel do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") # Use a 'anon_key', NUNCA a 'service_role_key'

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("FALHA CRÍTICA: Variáveis do Supabase ausentes no .env")

def get_user_db(token: str) -> Client:
    """
    Gera um cliente Supabase focado no Tenant (Isolado).
    Injeta o JWT do usuário no cabeçalho. O PostgreSQL usará este token 
    para aplicar as políticas RLS e impedir vazamento de dados entre Arenas.
    """
    return create_client(
        SUPABASE_URL, 
        SUPABASE_KEY,
        options=ClientOptions(
            headers={"Authorization": f"Bearer {token}"}
        )
    )

# Cliente global (Apenas para rotas de admin ou healthchecks genéricos, sem RLS)
global_db: Client = create_client(SUPABASE_URL, SUPABASE_KEY)