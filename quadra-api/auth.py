import os
import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

security = HTTPBearer()

class UserContext(BaseModel):
    user_id: str
    role: str
    token: str 

def verify_jwt(credentials: HTTPAuthorizationCredentials = Security(security)) -> UserContext:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated" 
        )
        
        user_id = payload.get("sub")
        role = payload.get("role")

        if not user_id:
            raise HTTPException(status_code=401, detail="Token sem identificação.")
            
        return UserContext(user_id=user_id, role=role, token=token)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Token inválido ou forjado.")
