# Ronda - Harness de Evaluación y QA (`HARNESS.md`)

El **Harness** es el sistema de validación automatizada que acompaña a los subagentes durante el ciclo de vida de desarrollo de Ronda. Garantiza que cualquier cambio cumpla con las reglas establecidas en [`RULES.md`](./RULES.md).

---

## 1. Estructura del Harness

```
harness/
├── test_catalog.js     # Suite 1: Integridad del catálogo de CABA (IDs, barrios, precios)
├── test_filters.js     # Suite 2: Pre-filtrado y presupuesto estricto de tokens (<1200 toks)
├── test_rules.js       # Suite 3: Factibilidad del itinerario, tiempos y fallback determinista
├── run.js              # Runner principal para entorno Node.js
└── run_harness.py      # Runner auxiliar para validación con Python/Pydantic
```

---

## 2. Cómo Ejecutar el Harness

Para ejecutar todas las suites de prueba:

```bash
node harness/run.js
```

O en Python:
```bash
python -m harness.run_harness
```

---

## 3. Cobertura de Reglas

| Suite | Reglas Auditadas | Objetivo |
|---|---|---|
| **Suite 1: Catálogo** | `RULE-DOM-01`, `RULE-TOK-01` | Prevenir alucinaciones verificando que los lugares existan y estén balanceados en Palermo, San Telmo y Recoleta. |
| **Suite 2: Filtros & Tokens** | `RULE-TOK-02`, `RULE-DOM-02` | Garantizar que el prompt a Gemini nunca supere el presupuesto de tokens asignado. |
| **Suite 3: Factibilidad & Fallback** | `RULE-DOM-03`, `RULE-DEV-03` | Asegurar que los itinerarios tengan horarios lógicos, traslados y que la app nunca falle si la API de IA no responde. |
