from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

NeighborhoodType = Literal[
    "Palermo", "San Telmo", "Recoleta", "Chacarita", "Colegiales", "Belgrano",
    "San Nicolás", "Puerto Madero", "Caballito", "Almagro", "Villa Crespo", "Cualquiera"
]
TimeOfDayType = Literal["morning", "afternoon", "night", "full_day"]
MoodType = Literal["pareja", "amigos", "solo", "foodie", "cultural", "tranquilo"]
PriceTierType = Literal["$", "$$", "$$$"]

class Place(BaseModel):
    id: str
    name: str
    neighborhood: str
    category: str
    subcategories: List[str]
    address: str
    price_tier: str
    typical_duration_minutes: int
    recommended_times: List[str]
    vibe: str
    highlight: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    description: Optional[str] = None
    activities: Optional[List[str]] = Field(default_factory=list)
    image_url: Optional[str] = None
    about: Optional[str] = None
    payment_methods: Optional[str] = None
    pet_friendly: Optional[bool] = None
    pet_friendly_details: Optional[str] = None
    vegetarian_friendly: Optional[bool] = None
    vegetarian_details: Optional[str] = None
    features: Optional[List[str]] = Field(default_factory=list)
    play_category: Optional[List[str]] = Field(default_factory=list)
    game_highlight: Optional[str] = None
    horarios_detallados: Optional[str] = None
    days_open: Optional[List[str]] = Field(default_factory=list)
    open_hour: Optional[float] = None
    close_hour: Optional[float] = None
    close_hour_weekend: Optional[float] = None
    schedule_by_day: Optional[Dict[str, Any]] = Field(default_factory=dict)

class PlanRequest(BaseModel):
    neighborhood: NeighborhoodType = Field(default="Cualquiera", description="Barrio preferido o Cualquiera")
    time_of_day: TimeOfDayType = Field(default="afternoon", description="Momento del día")
    mood: MoodType = Field(default="amigos", description="Ocasión o vibe del plan")
    price_tier: Optional[PriceTierType] = Field(default="$$", description="Rango de presupuesto deseado")
    custom_notes: Optional[str] = Field(default="", description="Detalles adicionales (ej. ganas de caminar, merienda dulce)")
    start_time: Optional[str] = Field(default=None, description="Hora de salida en formato HH:MM (ej. '01:20' o '21:30')")
    is_now: bool = Field(default=False, description="True si el plan es espontáneo para salir ahora mismo")
    day_of_week: Optional[str] = Field(default=None, description="Día de la semana en minúsculas en inglés (ej. 'monday', 'friday')")
    allow_neighboring_barrio: bool = Field(default=False, description="Permite conectar la 3ra parada con un barrio lindero contiguo")
    target_neighborhood: Optional[str] = Field(default=None, description="Barrio ancla resuelto internamente si se solicitó Cualquiera")

class TransitInfo(BaseModel):
    mode: str = Field(description="Modo de traslado sugerido: a pie, taxi, colectivo, o no aplica")
    duration_minutes: int = Field(description="Minutos estimados de traslado")
    notes: Optional[str] = Field(default="", description="Detalle de la ruta (ej: caminar por Pasaje Santa Rosa)")

class PlanItem(BaseModel):
    time_slot: str = Field(description="Horario estimado, ej. '16:30 - 17:45'")
    place_name: str = Field(description="Nombre del lugar seleccionado")
    address: str = Field(description="Dirección real en CABA")
    activity_type: str = Field(description="Tipo de actividad, ej. 'Café y lectura', 'Visita cultural'")
    duration_minutes: int = Field(description="Tiempo recomendado de permanencia")
    porteño_tip: str = Field(description="Consejo clave de identidad porteña o recomendación del lugar")
    lat: Optional[float] = Field(default=None, description="Latitud geográfica en CABA")
    lng: Optional[float] = Field(default=None, description="Longitud geográfica en CABA")
    description: Optional[str] = Field(default=None, description="Descripción enriquecida del lugar")
    activities: Optional[List[str]] = Field(default_factory=list, description="Cosas recomendadas para hacer en el lugar")
    image_url: Optional[str] = Field(default=None, description="Ruta a la foto del lugar")
    about: Optional[str] = Field(default=None, description="Resumen histórico y de ambiente del lugar")
    payment_methods: Optional[str] = Field(default=None, description="Medios de pago aceptados")
    pet_friendly: Optional[bool] = Field(default=None, description="Si es apto mascotas")
    pet_friendly_details: Optional[str] = Field(default=None, description="Detalle de política pet friendly")
    vegetarian_friendly: Optional[bool] = Field(default=None, description="Si tiene opciones vegetarianas")
    vegetarian_details: Optional[str] = Field(default=None, description="Detalle de opciones vegetarianas")
    features: Optional[List[str]] = Field(default_factory=list, description="Características destacadas")
    is_closing_soon: Optional[bool] = Field(default=False, description="True si la parada queda a menos de 60-75 min del cierre")
    closing_soon_warning: Optional[str] = Field(default=None, description="Alerta porteña si está próximo al cierre")
    closes_at: Optional[str] = Field(default=None, description="Horario de cierre en formato amigable (ej: '02:00 hs')")
    transit_to_next: Optional[TransitInfo] = Field(default=None, description="Traslado hacia el siguiente punto")

class SuggestedActivityInfo(BaseModel):
    id: str
    title: str
    category: str
    days: str
    location: str
    photo: Optional[str] = None
    description: str
    tips: Optional[str] = None
    is_free: bool = True
    weather: str = "outdoor"
    valid_days: Optional[List[str]] = Field(default_factory=list, description="Días fácticos de funcionamiento en inglés (ej: ['saturday', 'sunday'])")

class PlanResponse(BaseModel):
    id: str
    title: str = Field(description="Título evocativo del plan, ej: 'Tarde de libros, café y bohemia en Palermo'")
    neighborhood: str = Field(description="Barrio(s) principal(es) del recorrido")
    mood: str
    estimated_cost: str
    narrative_summary: str = Field(description="Resumen cálido y descriptivo de la experiencia")
    schedule: List[PlanItem] = Field(description="Secuencia cronológica optimizada de actividades")
    suggested_activity: Optional[SuggestedActivityInfo] = Field(default=None, description="Actividad o feria sugerida del barrio para completar la ronda")
    saved_at: Optional[str] = Field(default=None, description="Fecha en que se guardó el plan si aplica")

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    google_sub: Optional[str] = None
    neighborhood: Optional[str] = "San Telmo"
    pet_friendly: Optional[bool] = False
    vegetarian_friendly: Optional[bool] = False
    budget_preference: Optional[str] = "$$"

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    neighborhood: Optional[str] = "San Telmo"
    pet_friendly: Optional[bool] = False
    vegetarian_friendly: Optional[bool] = False
    budget_preference: Optional[str] = "$$"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserPreferencesUpdate(BaseModel):
    neighborhood: Optional[str] = None
    pet_friendly: Optional[bool] = None
    vegetarian_friendly: Optional[bool] = None
    budget_preference: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    name: str = "Viajero Porteño"
    email: str = ""
    auth_provider: Optional[str] = "google"
    neighborhood: str
    pet_friendly: bool
    vegetarian_friendly: bool
    budget_preference: str
    saved_plans: List[dict] = Field(default_factory=list)
    favorite_place_ids: List[str] = Field(default_factory=list)
    token: Optional[str] = None


