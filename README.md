# Ronda - Salidas e Itinerarios con Identidad Porteña en CABA 🧉

**Ronda** es una aplicación inteligente desarrollada con una arquitectura multi-agente que genera planes personalizados y realistas en la Ciudad Autónoma de Buenos Aires (Palermo, San Telmo, Recoleta).

A diferencia de guías genéricas o desactualizadas, Ronda conecta paradas caminables, respeta los tiempos de sobremesa y destaca el **"Toque Porteño"** auténtico de cada lugar mediante un catálogo curado local y modelos de lenguaje optimizados con control estricto de tokens.

---

## 🏛 Arquitectura Multi-Agente & Harness

El proyecto está diseñado y gobernado bajo un equipo agentico:
- **Orquestador**: Planificación, descomposición de tareas y gestión de tokens ([AGENTS.md](./AGENTS.md)).
- **Investigador**: Datos de dominio de CABA y optimización de prompts.
- **Programador**: Implementación de backend (FastAPI) y frontend (Vite + React + Tailwind CSS).
- **Revisor & Harness**: Auditoría automatizada de reglas de factibilidad, geografía y presupuesto de tokens ([RULES.md](./RULES.md) y [HARNESS.md](./HARNESS.md)).

---

## 🚀 Cómo Ejecutar Ronda Localmente

### 1. Backend (FastAPI + Python 3.12)
El backend corre en el puerto `8000`:

```powershell
# En la raíz del proyecto
& .\backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
```
- Endpoint de verificación: `http://localhost:8000/api/health`
- Documentación interactiva Swagger: `http://localhost:8000/docs`

> **Nota sobre Gemini**: Puedes colocar tu API Key en `backend/.env` (`GEMINI_API_KEY=tu_clave`). Si no dispones de una clave, el motor de fallback determinista (`RULE-DEV-03`) generará automáticamente planes de alta fidelidad desde el catálogo verificado.

### 2. Frontend (Vite + React + Tailwind CSS)
El frontend corre en el puerto `5173`:

```bash
cd frontend
npm run dev
```
Abre tu navegador en: `http://localhost:5173`

---

## 🧪 Ejecutar el Harness de Evaluación

Para auditar el cumplimiento estricto de las reglas:

```bash
node harness/run.js
```
O en Python:
```powershell
& .\backend\.venv\Scripts\python.exe -m harness.run_harness
```
