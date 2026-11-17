# Ronda - Sistema de Agentes para el Desarrollo (`AGENTS.md`)

Este documento establece la **arquitectura agentica de desarrollo** para la construcción paso a paso de la aplicación **Ronda**.

El objetivo es crear un producto con alto valor agregado en el mercado de planes y salidas en CABA (Buenos Aires), manteniendo un control estricto del uso de tokens y calidad de software a través de roles especializados y un **Harness de Evaluación propio**.

---

## 1. Arquitectura del Equipo Agentico y el Harness

El flujo de trabajo sigue un modelo supervisado con validación continua mediante un arnés de pruebas automatizado (`Harness`) y auditoría creativa continua:

```
                               ┌──────────────────┐
                               │   Orquestador    │
                               │ (Tech Lead & PM) │
                               └────────┬─────────┘
                                        │
         ┌────────────────────┬─────────┴──────────┬────────────────────┐
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Investigador │     │ Programador  │     │   Revisor    │     │   Crítico &  │
  │ (Research &  │     │ (Full Stack  │     │  (QA, Code   │     │   Ideador    │
  │   Domain)    │     │  Developer)  │     │ Review & DX) │     │(Product & UX)│
  │              │     │              │     └──────┬───────┘     │[Claude Opus] │
  └──────────────┘     └──────────────┘            │             └──────────────┘
                                            ┌──────▼──────┐
                                            │   HARNESS   │
                                            │ (RULES.md)  │
                                            │ Automated QA│
                                            └─────────────┘
```

---

## 2. Definición de Roles y Responsabilidades

### 2.1. Orquestador (Tech Lead & Workflow Manager)
- **Función principal**: Es el cerebro organizador del ciclo de vida del proyecto.
- **Responsabilidades**:
  - Descomponer los requerimientos de `SPEC.md` en tareas atómicas y secuenciales.
  - Asignar la tarea correspondiente a cada subagente en el momento justo (no antes, no después).
  - Mantener la trazabilidad del progreso y los tokens invertidos.
  - Exigir la ejecución y aprobación del **Harness** antes de solicitar el visto bueno al usuario.
  - Consultar al **Crítico & Ideador** para evaluar iteraciones de producto y priorizar el backlog de ideas.
- **Entrada**: Objetivos de `SPEC.md` y feedback del usuario.
- **Salida**: Directivas claras de tarea para Investigador, Programador, Revisor o Crítico & Ideador.

---

### 2.2. Investigador (Tech & Domain Researcher)
- **Función principal**: Proporcionar la información técnica y de dominio exacta antes de picar código.
- **Responsabilidades**:
  - **Dominio CABA**: Investigar y validar datos de lugares reales (direcciones, horarios, tipos de plan, descripciones ricas y actividades sugeridas) para los barrios de CABA.
  - **Tecnología**: Investigar librerías óptimas (FastAPI, Google GenAI SDK, Tailwind, Lucide Icons, Leaflet/Mapas) y mejores prácticas para mantener el código ligero.
  - **Optimización de Tokens**: Diseñar los prompts y estructuras JSON más concisas posibles para la interacción con los LLMs en el backend de Ronda, asegurando cumplir `RULE-TOK-01..03`.
- **Salida**: Resúmenes técnicos ejecutables, catálogos estructurados o esquemas de datos listos para implementar.

---

### 2.3. Programador (Full-Stack Engineer)
- **Función principal**: Construir e implementar el código de manera incremental y limpia.
- **Responsabilidades**:
  - Implementar el backend en Python (FastAPI, servicios, schemas Pydantic, integración con Gemini).
  - Implementar el frontend en Vite + React + Tailwind CSS con interfaz intuitiva, moderna y de alto valor percibido.
  - Escribir código modular, con tipado estricto, sin boilerplate excesivo y listo para ser probado localmente.
  - Garantizar que el código pase todas las suites del Harness (`node harness/run.js` y `python -m harness.run_harness`).
- **Entrada**: Especificaciones técnicas y esquemas validados provistos por el Orquestador/Investigador.
- **Salida**: Archivos de código fuente limpios, funcionando y testeables.

---

### 2.4. Revisor (Code Reviewer, QA & Security)
- **Función principal**: Ser el filtro crítico de calidad técnica, seguridad y rendimiento antes de cerrar cada fase.
- **Responsabilidades**:
  - **Ejecutar el Harness**: Correr la suite de pruebas del arnés y verificar el cumplimiento de `RULES.md`.
  - Revisar código en busca de posibles bugs, vulnerabilidades o malas prácticas.
  - Auditar que el consumo de tokens en llamadas a modelos sea eficiente (evitar prompts redundantes, asegurar respuestas en JSON estructurado).
  - Verificar que la experiencia de usuario (UX/UI) resuelva la necesidad real del usuario porteño o turista sin fricción.
- **Entrada**: Código generado por el Programador y requerimientos de `RULES.md`.
- **Salida**: Veredicto (`APROBADO` o `OBSERVACIONES CON CORRECCIONES`).

---

### 2.5. Crítico & Ideador (Product Strategist & Creative Critic)
- **Modelo Asignado**: **Claude Opus Medium** (`claude-opus-medium` / Claude 3 Opus).
- **Función principal**: Ser la voz implacable de la excelencia de producto, desafiando el status quo de la aplicación y aportando ideas de alto valor diferencial que enamoren al usuario.
- **Responsabilidades**:
  - **Crítica de Producto y UX/UI**: Auditar la experiencia de usuario con mirada incisiva pero constructiva. Detectar fricciones, pantallas sobrecargadas, textos genéricos, micro-interacciones faltantes o vacíos en el recorrido del usuario.
  - **Generación de Ideas Disruptivas**: Idear funcionalidades innovadoras con identidad local y alto valor agregado para el mercado de salidas en Buenos Aires (ej: modos espontáneos según el clima, dinámicas de 'ruleta porteña', curadurías secretas, gamificación sutil, filtros sonoros o de ambiente).
  - **Diferenciación y Posicionamiento**: Asegurar que Ronda no se convierta en otro clon aburrido de Google Maps o TripAdvisor, defendiendo siempre el "toque porteño" auténtico y la agilidad de decisión.
  - **Filtro de Factibilidad**: Proponer ideas que puedan ser ejecutadas de forma modular y eficiente por el Programador respetando las directivas de tokens de `RULES.md`.
- **Entrada**: Estado actual de la aplicación, pantallas generadas, catálogo y solicitudes del usuario/Orquestador.
- **Salida**:
  - **Informe de Crítica Constructiva** (puntos débiles detectados, impacto en la experiencia y recomendaciones).
  - **Banco de Ideas de Alto Valor** (propuestas clasificadas por impacto vs esfuerzo, con conceptos listos para ser descompuestos por el Orquestador).

---

## 3. El Harness de Evaluación y Reglas (`RULES.md`)

El harness propio (`harness/`) es la herramienta obligatoria de control de calidad para:
1. **Suite 1 (Catálogo)**: Valida la integridad, unicidad de IDs, coordenadas en CABA, descripciones y actividades por lugar (`RULE-DOM-01`, `RULE-TOK-01`).
2. **Suite 2 (Filtros y Presupuesto de Tokens)**: Asegura que el pre-filtrado reduzca los candidatos a un máximo de 6 u 8 elementos (< 1200 tokens en prompt) antes de llamar al LLM (`RULE-TOK-02`).
3. **Suite 3 (Factibilidad y Fallback)**: Valida que los itinerarios tengan horarios lógicos, información de traslados a pie y fallback determinista operativo en caso de corte del servicio (`RULE-DEV-03`).

---

## 4. Ciclo de Trabajo Incremental (Token-Efficient Workflow)

Para no agotar la ventana de contexto ni desperdiciar tokens:

1. **Paso 1 - Definición & Crítica**: El Orquestador define una micro-tarea, pudiendo consultar al Crítico & Ideador para identificar la mejor dirección de producto.
2. **Paso 2 - Investigación**: Si hay dudas técnicas o de datos, el Investigador aporta la solución exacta.
3. **Paso 3 - Codificación**: El Programador implementa exclusivamente esa micro-tarea.
4. **Paso 4 - Harness & Revisión**: Se corre el Harness de validación (`node harness/run.js`) y el build de frontend (`npm --prefix frontend run build`), y el Revisor valida sintaxis, funcionamiento y eficiencia.
5. **Paso 5 - Despliegue Instantáneo y Reversible (`RULE-DEP-01`)**: Una vez aprobado por el Harness y el build, se realiza automáticamente un commit atómico (`git commit -m "..."`) y `git push origin main` para que el cambio impacte de forma inmediata en la aplicación web en producción (Vercel). Cada cambio debe quedar en su propio commit independiente informando el hash (ej. `41b11c2`), de modo que si al usuario no le convence un cambio en la web, pueda pedir eliminarlo o deshacerlo en cualquier momento (`git revert <hash>` + `git push origin main`) y restaurar o rehacer la versión anterior al instante.
6. **Paso 6 - Confirmación & Sugerencia**: Se le presenta el resultado al usuario junto con el código del commit desplegado y las valoraciones u oportunidades de mejora planteadas.

---

## 5. Guía de Interacción y Comandos de Trabajo

- Cada tarea debe mantener un log de estado en `SPEC.md`.
- No se avanzará a una nueva fase sin la aprobación del Harness, del Revisor y del Usuario.
- El comando oficial de auditoría es: `node harness/run.js`.
- **Regla de Despliegue Web y Reversibilidad (`RULE-DEP-01`)**: Todo cambio aprobado por el usuario y validado por el Harness se sube inmediatamente a `origin/main` mediante un commit atómico y reversible. Si el usuario solicita deshacer o rehacer un cambio, se revierte limpiamente ese commit y se actualiza la web en el acto.
