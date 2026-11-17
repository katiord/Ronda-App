# Reglas Básicas de Ronda (`RULES.md`)

Este documento define las reglas inquebrantables de arquitectura, dominio y calidad para la aplicación **Ronda**. Estas reglas son auditadas de forma automática mediante el **Harness** y de forma manual por el **Revisor**.

---

## 1. Reglas de Dominio y Geografía (CABA)

- **[RULE-DOM-01] Coherencia Territorial**:
  - Un plan dentro de un mismo bloque horario (ej. una tarde) no debe mezclar barrios no contiguos (ej. San Telmo y Palermo) a menos que el usuario seleccione expresamente "Día completo" o "Cualquiera" y se especifique el traslado explícito.
  - La distancia caminando entre actividades consecutivas dentro del mismo barrio no debe exceder los 20 minutos (aprox. 15-20 cuadras).
- **[RULE-DOM-02] Realismo Temporal y Apertura**:
  - Actividades de café / brunch deben asignarse a bloques de `morning` o `afternoon`.
  - Actividades de bares notables con trasnoche, speakeasy o coctelería deben asignarse a bloques de `night` o tarde-noche.
  - Museos y centros culturales deben respetar días de visita (ej. evitar lunes) y horarios diurnos/vespertinos.
- **[RULE-DOM-03] Identidad Porteña Auténtica**:
  - Cada recomendación debe incluir un `porteño_tip` o valor agregado que no sea genérico (ej. "el café con leche con medialunas en la mesa junto a la ventana donde escribía Sabato", "el bife de lomo cortado con cuchara").
- **[RULE-DOM-04] Diversidad Categórica y Coherencia Secuencial**:
  - Ningún itinerario puede contener dos paradas consecutivas con la misma categoría principal (queda expresamente prohibido `cafe -> cafe` y `dining -> dining`).
  - Las tardes deben articular actividades culturales/paseos con pausas gastronómicas (paseo/parque/cultura + café/merienda + helado o vermut al atardecer).
  - A partir de las 19:15 hs, no se sugieren cafeterías diurnas; se prioriza vermutería, cena temprana o bodegón, seguido de coctelería o sobremesa.
- **[RULE-DOM-05] Comida Fuerte Única por Itinerario**:
  - En cualquier salida de almuerzo o cena, queda terminantemente prohibido sugerir dos comidas pesadas en el mismo itinerario.
  - La pertenencia a comida fuerte (`HEAVY_FOOD_SUBTYPES`: bodegón, parrilla, criollo, restaurante) limita la ronda a exactamente una comida principal. Las demás paradas gastronómicas solo pueden ser café, heladería o bar de aperitivos/tragos.
- **[RULE-DOM-06] Café Único en Franjas Diurnas**:
  - En salidas de mañana o merienda, solo se admite una parada de cafetería de especialidad / tostaduría para evitar duplicidad de café de filtro.
- **[RULE-DOM-07] Matriz Canónica de 3 Paradas y Navegación Peatonal Continua (Anti-Zigzag)**:
  - Las rondas deben estructurarse según la plantilla canónica por momento del día:
    * **Mañana (08:00 - 11:30)**: Parada 1: Desayuno/Café -> Parada 2: Cultura/Museo/Galería -> Parada 3: Almuerzo temprano O Parque/Paseo verde.
    * **Mediodía / Almuerzo (11:30 - 15:00)**: Parada 1: Almuerzo Porteño (ÚNICA comida fuerte) -> Parada 2: Paseo/Parque/Feria/Cultura (para bajar la comida) -> Parada 3: Café de sobremesa o Helado artesanal.
    * **Tarde / Merienda (15:00 - 19:30)**: Parada 1: Merienda/Café de culto -> Parada 2: Feria/Antigüedades/Paseo cultural -> Parada 3: Cena temprana / Vermut y tapeo en bar notable.
    * **Noche (19:30 - 23:59)**: Parada 1: Vermut/Previa liviana de autor -> Parada 2: Cena Principal (ÚNICA comida) -> Parada 3: Coctelería de autor, Pool/Fichines o Heladería nocturna.
    * **Trasnoche (00:00 - 05:00)**: Parada única de refugio noctámbulo (24hs, barra o billar).
  - **Ruta Anti-Zigzag**: Las paradas deben ordenarse de forma monotónica y continua a lo largo del corredor peatonal, minimizando distancias y evitando cruces reiterados de autopistas o avenidas divisorias.
- **[RULE-DOM-08] Validación Fáctica de Días para Actividades y Ferias**:
  - Las ferias y actividades de fin de semana (`valid_days: ['saturday', 'sunday']`) jamás deben sugerirse en salidas de días hábiles (lunes a viernes).
  - En días de semana, el sistema debe alternar automáticamente a paseos, pasajes históricos, museos abiertos o corredores urbanos verificados de lunes a viernes.

---

## 2. Reglas de Eficiencia de Tokens y LLM

- **[RULE-TOK-01] Zero-Hallucination & Grounding**:
  - Todo lugar incluido en un itinerario debe pertenecer al catálogo verificado o tener datos geográficos y comerciales fácticos.
  - El LLM actúa como planificador, selector y redactor narrativo sobre candidatos filtrados previamente, nunca inventando nombres o direcciones ficticias.
- **[RULE-TOK-02] Pre-filtrado Determinista**:
  - Antes de llamar a Gemini, el backend debe filtrar el catálogo a un subconjunto relevante (máximo 6 a 8 candidatos) según barrio, presupuesto y momento del día. Está prohibido enviar el catálogo completo sin filtrar al prompt.
- **[RULE-TOK-03] Salida Estructurada Obligatoria**:
  - Todas las respuestas del modelo deben regirse por un esquema JSON estricto (`response_mime_type="application/json"` o schema Pydantic). Queda prohibido el texto libre conversacional no estructurado entre backend y modelo.

---

## 3. Reglas de Calidad de Software y Arquitectura

- **[RULE-DEV-01] Tipado Estricto**:
  - Tanto en Python (Pydantic v2 / Type hints) como en Frontend (TypeScript / PropTypes / Interfaces claras), no se permiten tipos `any` o datos sin validar.
- **[RULE-DEV-02] Aislamiento de Capas**:
  - Frontend nunca llama directamente a las APIs de IA ni a fuentes de datos externas; siempre pasa por el backend `/api/plans/...`.
  - El backend mantiene desacoplado el motor de IA (`planner.py`) del controlador web (`main.py`).
- **[RULE-DEV-03] Manejo de Fallos Elegante**:
  - Si el servicio de IA experimenta latencia o límite de cuota, el backend debe contar con un fallback determinista basado en el catálogo para nunca devolver una pantalla rota al usuario.

---

## 4. Reglas del Harness y Criterio de Aceptación

- **[RULE-HARN-01] Aprobación del Harness**:
  - Ningún cambio de código o prompt puede ser aprobado si el comando `python -m harness.run_harness` (o `node harness/run.js`) reporta errores o fallos en las aserciones.

---

## 5. Reglas de Comunicación e Interacción con el Usuario

- **[RULE-COM-01] Idioma Español Obligatorio**:
  - Todas las consultas, avisos, pedidos de confirmación y preguntas dirigidas al usuario deben redactarse estrictamente en español.
- **[RULE-COM-02] Transparencia en Permisos y Accesos**:
  - Al solicitar accesos, autorizaciones de ejecución fuera del sandbox o permisos del sistema, se debe explicar de manera clara y sencilla en español qué comando o acción se ejecutará y el motivo exacto por el cual se requiere.
- **[RULE-COM-03] Justificación de Uso de APIs y MCP**:
  - Cada vez que se identifique o plantee la necesidad de utilizar una API externa o una herramienta/servidor MCP, se debe explicar previamente al usuario por qué es necesaria, qué valor aporta y qué implicancias tiene.
- **[RULE-COM-04] Ruteo Directo de Subagentes por el Orquestador**:
  - Cuando el usuario inicie su mensaje o mencione directamente a un rol:
    - Si dice **"programador"**, el Orquestador delega inmediatamente la tarea al subagente `Programador` (Full-Stack Engineer, ver `AGENTS.md`).
    - Si dice **"investigador"**, el Orquestador delega inmediatamente la tarea al subagente `Investigador` (Tech & Domain Researcher, ver `AGENTS.md`). No se admiten variantes fuera del documento (ej. queda descartado cualquier subagente tipo "Investigador BA Cultura").
    - Si dice **"revisor"**, el Orquestador delega inmediatamente la tarea al subagente `Revisor` (Code Reviewer, QA & Security, ver `AGENTS.md`).
    - Si dice **"criticador"** o **"crítico"**, el Orquestador delega inmediatamente la tarea al subagente `Crítico & Ideador` (Product Strategist & Creative Critic, ver `AGENTS.md`).
  - El Orquestador supervisa la ejecución, asegura el cumplimiento de las reglas del proyecto y entrega el resultado consolidado al usuario.

---

## 6. Reglas de Seguridad e Integridad del Entorno Local

- **[RULE-SEC-01] Notificación y Evaluación de Riesgo de Instalaciones**:
  - Antes de instalar cualquier paquete, librería, dependencia (npm/pip) o herramienta en el entorno local, se debe informar explícitamente al usuario.
  - La notificación debe detallar:
    1. **Nombre y propósito** exacto del paquete o herramienta.
    2. **Ámbito de instalación**: aclarar si es local y aislado al proyecto (ej. `node_modules/` o entorno virtual `venv`) o si afecta al sistema global.
    3. **Evaluación de seguridad y riesgos potenciales**: confirmar si es una dependencia estándar de la industria, si tiene reputación comprobada, o si presenta algún riesgo para el sistema operativo o archivos del usuario.
    4. Solicitar la aprobación del usuario antes de proceder si involucra cambios sensibles.

---

## 7. Reglas de Despliegue Web Instantáneo y Reversibilidad

- **[RULE-DEP-01] Despliegue Instantáneo y Commits Atómicos Reversibles**:
  - Todo cambio de código que haya sido solicitado/aprobado por el usuario y haya superado el Harness (`node harness/run.js`) y la compilación (`npm --prefix frontend run build`) debe subirse de inmediato al repositorio remoto (`git commit` + `git push origin main`) para que impacte automáticamente en la aplicación web (Vercel).
  - **Reversibilidad Garantizada**: Cada cambio debe registrarse en un **commit atómico e independiente** (informando siempre el hash corto al usuario). Si el usuario decide que un cambio no le gusta al verlo en la web, el equipo revertirá ese commit específico (`git revert --no-edit <commit_hash>` seguido de `git push origin main`) o lo rehará sin afectar el resto del progreso.
