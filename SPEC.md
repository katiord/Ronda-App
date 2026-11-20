# Ronda - Especificación Técnica y Funcional (`SPEC.md`)

> **Estado**: Aprobado para Fase 1 (MVP Incremental)  
> **Versión**: 1.0.0  
> **Ubicación piloto**: Ciudad Autónoma de Buenos Aires (CABA)  

---

## 1. Visión y Propuesta de Valor

**Ronda** es una aplicación diseñada para transformar la forma en que residentes y turistas descubren y disfrutan de Buenos Aires. 

A diferencia de guías tradicionales dispersas (TripAdvisor, Google Maps desordenado o blogs desactualizados), **Ronda genera planes integrales y coherentes** en minutos:
- Agrupa actividades compatibles (ej: café de especialidad + paseo cultural + trago en bar notable o speakeasy).
- Optimiza los traslados a pie o transporte local para evitar traslados absurdos.
- Respeta la identidad porteña auténtica y horarios reales de la ciudad.

---

## 2. Alcance Inicial del MVP (Fase 1: Piloto Acotado)

Para maximizar el valor de producto y utilizar los tokens de forma eficiente:
1. **Barrios Piloto Iniciales**:
   - **Palermo** (Soho / Hollywood): Vanguardia gastronómica, diseño, cafés de especialidad y coctelería.
   - **San Telmo**: Bohemio, histórico, bares notables, anticuarios, bodegones y arte.
   - **Recoleta**: Museos, parques, arquitectura clásica, elegancia y meriendas tradicionales.
2. **Estrategia de Datos (Zero-Hallucination & Token Saver)**:
   - Catálogo curado en archivo local `data/places_caba.json` con 30+ lugares representativos, verificados con horarios, coordenadas/direcciones, rangos de precio y vibras.
   - El motor de IA (Gemini) actúa como curador y planificador personalizado sobre este catálogo estructurado, garantizando planes 100% reales sin gastar tokens en búsquedas web innecesarias.

---

## 3. Arquitectura del Sistema

### 3.1. Stack Tecnológico
- **Backend**: Python 3.10+
  - **Framework**: FastAPI (rápido, tipado estricto, documentación Swagger automática).
  - **Validación**: Pydantic v2 (esquemas de entrada y salida consistentes).
  - **IA**: SDK oficial `google-genai` conectando a `gemini-2.5-flash` (alta velocidad, costo mínimo y excelente soporte de salida JSON).
- **Frontend**: Vite + React + Tailwind CSS
  - Interfaz moderna, minimalista y mobile-first.
  - Componentes para seleccionar: Momento del día (mañana, tarde, noche), Tipo de salida (pareja, amigos, solo, cultural, foodie), Barrio(s) y Presupuesto.
  - Renderizado del plan en formato tarjeta/timeline cronológico.

---

## 4. Requerimientos Funcionales (RF)

- **RF-01 (Formulario de Preferencias)**:
  - Selector de Barrio: Palermo, San Telmo, Recoleta (o "Sorpréndeme").
  - Momento / Duración: Mañana (desayuno/paseo), Tarde (almuerzo/merienda/cultura), Noche (cena/tragos/música), Día completo.
  - Mood / Ocasión: Pareja / Cita romántica, Salida con amigos, Plan tranquilo / Solo, Foodie / Cafés, Turista cultural.
  - Presupuesto: Económico ($), Moderado ($$), Exclusivo ($$$).
- **RF-02 (Generación Inteligente de Ronda)**:
  - Endpoint `POST /api/plans/generate`: Cruza el catálogo curado con los filtros y utiliza un prompt conciso con salida JSON estricta para devolver la secuencia del plan.
- **RF-03 (Visualización del Itinerario)**:
  - Muestra la línea de tiempo: Hora estimada, Lugar, Dirección, Por qué ir (el toque porteño), Tiempo estimado y cómo llegar al siguiente punto.

---

## 5. Roadmap de Construcción Incremental (Guiado por Agentes)

Cada paso es coordinado por el **Orquestador**, investigado por el **Investigador**, codificado por el **Programador** y auditado por el **Revisor**:

- [x] **Paso 1: Catálogo Curado de CABA & Modelos de Datos**
  - Crear `backend/data/places_caba.json` con lugares validados de Palermo, San Telmo y Recoleta (25 lugares verificados).
  - Definir schemas Pydantic (`PlanRequest`, `Place`, `PlanResponse`, `TransitInfo`, `PlanItem`).
- [x] **Paso 2: Backend FastAPI & Integración Gemini**
  - Crear servicio `backend/app/planner.py` con pre-filtrado de tokens (< 1200 tokens) y llamada estructurada a Gemini 2.5 Flash.
  - Implementar fallback determinista ante fallos de API o sin credenciales (`RULE-DEV-03`).
  - Crear endpoints en `backend/app/main.py` (`/api/health`, `/api/places`, `/api/plans/generate`).
  - Pruebas de integración aprobadas (`backend/test_api.py` y suites del Harness).
- [x] **Paso 3: Frontend Vite + React + Tailwind**
  - Scaffold de Vite + React configurado con Tailwind CSS y `@tailwindcss/vite`.
  - Interfaz de pantalla única limpia con estética clara (marfil, arena y terracota).
  - Selectores visuales interactivos de Barrio, Momento del día, Mood/Ocasión, Presupuesto y Notas.
  - Componente de visualización del itinerario en línea de tiempo (timeline vertical) con paradas, tiempos de permanencia, consejos porteños y traslados a pie calculados.
  - Compilación exitosa en producción (`npm run build`).
- [x] **Paso 4: Sincronización Horaria Dinámica ("Salir Ahora") & Integración Social**
  - Sincronización horaria real: detección de la hora exacta de la consulta para salidas espontáneas (`start_time`, `is_now`), eliminando paradas en el pasado.
  - Generador de horarios matemáticos reales tanto en backend (`planner.py`) como en frontend fallback.
  - Filtro dinámico de trasnoche: selección de bares y lugares abiertos para madrugadas (00:00 - 05:00 am).
  - Botón de compartir en WhatsApp con mensaje estructurado e itinerario porteño.
- [x] **Paso 5: Mapa Interactivo Embebido & Navegación Individual por Lugar**
  - Mapa embebido en la aplicación (`RondaMap.jsx`) con Leaflet y tiles suaves CartoDB Voyager.
  - Marcadores secuenciales interactivos (`1`, `2`, `3`) con la paleta visual de Ronda (marfil, terracota, verde bosque).
  - Trazado de ruta a pie (polilínea) uniendo todas las paradas en pantalla.
  - Popups interactivos con información de la parada y botón individual para abrir en Google Maps.
  - Botón "Cómo llegar en Maps" individualizado en cada tarjeta de actividad del itinerario, eliminando el enlace global saturado.
  - Enriquecimiento determinista de coordenadas (`lat`, `lng`) en los 42 lugares de CABA sin consumo de tokens de IA (`RULE-TOK-01`, `RULE-TOK-02`).
- [x] **Paso 6: Enriquecimiento Detallado & Cartas Translúcidas de Lugar**
  - Enriquecimiento del catálogo completo (43 lugares) con descripciones culturales porteñas auténticas y listas de actividades (`activities`).
  - Incorporación de Café Rivas en San Telmo (`santelmo_cafe_rivas`).
  - Modal translúcido con efecto de vidrio esmerilado (`backdrop-blur`) al tocar cualquier tarjeta de parada para explorar detalles y qué hacer en el lugar.
- [x] **Paso 7: Integración del Subagente 'Crítico & Ideador' (Claude Opus Medium)**
  - Definición del rol en `AGENTS.md` y registro activo del subagente `critico-ideador`.
  - Misión de auditoría de producto/UX y generación continua de ideas de alto impacto y bajo consumo de tokens.
- [x] **Paso 8: Erradicación de Inconsistencias & Diversidad Categórica (RULE-DOM-04)**
  - Regla `RULE-DOM-04` implementada en backend (`planner.py`) y testeada en `harness/test_rules.js`: erradicación total de paradas consecutivas de la misma categoría (`cafe -> cafe`, `dining -> dining`).
  - Ampliación del catálogo a **51 lugares reales verificados** en CABA con nuevos paseos, monumentos y atractivos al aire libre para enriquecer las tardes (Jardín Japonés, Floralis Genérica, Pasaje San Lorenzo / Casa Mínima, Paseo de Murales de Chacarita, Plaza Mafalda en Colegiales, Plaza Castelli en Belgrano R, Presidente Bar y Milión en Recoleta).
  - Corrección de etiquetas de actividades: heladerías y postres nunca se etiquetan como "Cena Porteña".
  - Sincronización de frontera tarde/noche: a partir de las 19:15 hs no se programan cafeterías diurnas que cierran.
- [x] **Paso 9: Rediseño Visual de Recomendados & Expansión de Agenda 'Cultura Abierta'**
  - Implementación de **Spot de Portada (Hero Editorial)** para la feria o actividad insignia de cada barrio con fotografía inmersiva full-bleed y botón de acción destacado.
  - Implementación de **Boletos Culturales (Ticket Style)** con troquelado visual, bloque de fecha/horario estilo boleto porteño y consejos de Ronda para el resto de actividades.
  - Implementación de **Cápsulas Translúcidas (Glass Cards)** con formato vertical 4:5 y vidrio esmerilado (`backdrop-blur-md`) para las 3 Joyitas Imperdibles, destacando el plato/trago insignia y eliminando la monotonía visual.
  - Expansión de la agenda con actividades oficiales de la Ciudad bajo el distintivo **🏛️ Cultura Abierta** (Música en Bares Notables, Conciertos en Anfiteatro Centenario, Jardín Andaluz en Museo Fernández Blanco, Ecoparque y milongas libres).
  - Filtro dedicado en la Agenda de Fin de Semana para explorar directamente los planes de **Cultura Abierta**.
- [x] **Paso 10: Ingreso Exclusivo con Google (Gmail) bajo Arquitectura Zero-PII ("Manos Limpias")**
  - Eliminación total de contraseñas propias, formularios manuales y opciones de otros proveedores en `ProfileModal.jsx`.
  - Integración de ingreso exclusivo con Google (Gmail) conectado directamente al **Pasaporte de Viajero Porteño** (pestañas *Pasaporte*, *Rondas*, *Favoritos* y *Preferencias*).
  - Sanitización y migración de `backend/data/users.json` y `backend/app/auth.py` con identificadores anónimos irreversibles (`SHA-256` con prefijo `g_`), garantizando cero almacenamiento de emails, nombres o contraseñas en el servidor.
  - Configuración de `API_BASE_URL` dinámica y respaldo en navegador para funcionamiento 100% web.
- [x] **Paso 11: Publicación Web Online y Validación Integral**
  - Configuración Todo-en-Uno para despliegue web gratuito (`vercel.json`, `api/index.py`, `requirements.txt` y `frontend/.env.example`).
  - Detección automática de dominio web en `frontend/src/App.jsx` y persistencia serverless read-only Zero-PII en `backend/app/auth.py`.
  - Auditoría final aprobada por el Revisor (`5/5` suites del Harness y build de producción).
- [x] **Paso 12: Conciencia de Ubicación & Filtro Anti-Cierre (Buffer de Traslado Porteño)**
  - Erradicación de la inconsistencia del "teletransporte" en salidas espontáneas ("Armar ya"): la app ahora tiene en cuenta el punto de partida real del usuario.
  - Botón de 1 tap `📍 Cerca mío` (detección GPS de barrio vía `navigator.geolocation`) y selector de origen "¿Desde dónde salís?" en vista rápida y en ajuste de barrio.
  - Estimación determinista de tiempos de traslado en CABA (`estimateTransitMinutes` y matriz de centros geográficos canónicos de los 11 barrios).
  - Sincronización fáctica de la Parada 1 calculando la llegada real (`startDt = hora actual + tiempo de viaje`).
  - **Regla Estricta Anti-Cierre**: Ningún lugar puede ser asignado a la Parada 1 si al llegar faltan menos de 60 minutos para su cierre (o menos de 75 min para cena/bodegón).
  - Tarjeta de partida en la pantalla de itinerario mostrando el origen, modo de traslado y tiempos de salida y llegada coordinados.
