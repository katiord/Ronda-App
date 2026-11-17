import os
import logging
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .schemas import (
    PlanRequest, 
    PlanResponse, 
    Place,
    GoogleAuthRequest,
    UserRegisterRequest,
    UserLoginRequest,
    UserPreferencesUpdate,
    UserProfileResponse
)
from .planner import generate_plan, ALL_PLACES
from .auth import (
    login_with_google,
    register_user,
    login_user,
    get_user_by_token,
    update_preferences,
    save_plan_for_user,
    remove_saved_plan,
    toggle_favorite_place
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ronda.api")

app = FastAPI(
    title="Ronda API",
    description="Motor agentico de salidas e itinerarios en CABA",
    version="1.0.0"
)

# Configuración de CORS para permitir conexión fluida con Vite + React
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Verifica el estado del servicio."""
    has_gemini_key = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return {
        "status": "online",
        "app": "Ronda API",
        "version": "1.0.0",
        "gemini_configured": has_gemini_key
    }

@app.get("/api/places", response_model=List[Place], tags=["Places"])
async def get_places(neighborhood: Optional[str] = Query(None, description="Filtrar por barrio (Palermo, San Telmo, Recoleta)")):
    """Devuelve los lugares verificados del catálogo curado."""
    if neighborhood and neighborhood.lower() != "cualquiera":
        filtered = [p for p in ALL_PLACES if p.neighborhood.lower() == neighborhood.lower()]
        return filtered
    return ALL_PLACES

@app.post("/api/plans/generate", response_model=PlanResponse, tags=["Plans"])
async def create_plan(request: PlanRequest):
    """
    Genera un itinerario personalizado en CABA.
    Utiliza el pre-filtrado inteligente de tokens y Gemini 2.5 Flash con fallback determinista.
    """
    try:
        logger.info(f"Generando plan para barrio: {request.neighborhood}, horario: {request.time_of_day}, mood: {request.mood}")
        plan = await generate_plan(request)
        return plan
    except Exception as e:
        logger.error(f"Error procesando plan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error al generar itinerario: {str(e)}")

@app.post("/api/auth/google", response_model=UserProfileResponse, tags=["Auth"])
async def api_google_login(req: GoogleAuthRequest):
    try:
        return login_with_google(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error en login con Google: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al autenticar con Google.")

@app.post("/api/auth/register", response_model=UserProfileResponse, tags=["Auth"])
async def api_register(req: UserRegisterRequest):
    try:
        return register_user(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error en registro: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al registrar usuario.")

@app.post("/api/auth/login", response_model=UserProfileResponse, tags=["Auth"])
async def api_login(req: UserLoginRequest):
    try:
        return login_user(req)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Error en login: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al iniciar sesión.")

@app.get("/api/auth/me", response_model=UserProfileResponse, tags=["Auth"])
async def api_get_current_user(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Token no proporcionado.")
    
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Sesión expirada o inválida.")
    return user

@app.put("/api/user/preferences", response_model=UserProfileResponse, tags=["User"])
async def api_update_preferences(prefs: UserPreferencesUpdate, authorization: Optional[str] = Header(None)):
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    user = get_user_by_token(token) if token else None
    if not user:
        raise HTTPException(status_code=401, detail="Sesión no autorizada.")
    try:
        return update_preferences(user.id, prefs)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/user/saved-plans", response_model=UserProfileResponse, tags=["User"])
async def api_save_plan(plan: dict, authorization: Optional[str] = Header(None)):
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    user = get_user_by_token(token) if token else None
    if not user:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para guardar una ronda.")
    plan_data = plan.get("plan", plan)
    return save_plan_for_user(user.id, plan_data)

@app.delete("/api/user/saved-plans/{plan_id}", response_model=UserProfileResponse, tags=["User"])
async def api_remove_plan(plan_id: str, authorization: Optional[str] = Header(None)):
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    user = get_user_by_token(token) if token else None
    if not user:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión.")
    return remove_saved_plan(user.id, plan_id)

@app.post("/api/user/favorites/{place_id}", response_model=UserProfileResponse, tags=["User"])
async def api_toggle_favorite(place_id: str, authorization: Optional[str] = Header(None)):
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    user = get_user_by_token(token) if token else None
    if not user:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para guardar favoritos.")
    return toggle_favorite_place(user.id, place_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
