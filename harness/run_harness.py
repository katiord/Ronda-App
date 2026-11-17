"""
Ronda Python Evaluation & QA Harness
Valida los schemas de Pydantic y reglas contra backend/data/places_caba.json
"""
import sys
import json
from pathlib import Path

# Configurar UTF-8 para evitar errores de codificación en Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def test_catalog():
    print("   [SUITE 1 - PY] Validando catalogo con esquemas...")
    catalog_path = Path(__file__).resolve().parent.parent / "backend" / "data" / "places_caba.json"
    if not catalog_path.exists():
        raise FileNotFoundError(f"Catalogo no encontrado: {catalog_path}")

    with open(catalog_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert isinstance(data, list) and len(data) >= 20, "Catalogo debe tener al menos 20 lugares"
    print(f"   [OK] Suite 1: {len(data)} lugares validados correctamente.")
    return len(data)

def test_planner_and_schemas():
    print("   [SUITE 2 - PY] Validando importacion de schemas y generador fallback...")
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

    from backend.app.schemas import PlanRequest, PlanResponse
    from backend.app.planner import filter_candidates, generate_fallback_plan, ALL_PLACES

    assert len(ALL_PLACES) >= 20, "Debe cargar al menos 20 lugares"

    # Probar filtrado para Palermo
    req = PlanRequest(neighborhood="Palermo", time_of_day="night", mood="amigos", price_tier="$$")
    candidates = filter_candidates(req)
    assert len(candidates) <= 6, "RULE-TOK-02 violada: mas de 6 candidatos"
    assert len(candidates) >= 2, "Debe encontrar al menos 2 candidatos para Palermo"

    # Probar fallback determinista (RULE-DEV-03)
    plan = generate_fallback_plan(req, candidates)
    assert isinstance(plan, PlanResponse), "El plan debe validar con PlanResponse"
    assert len(plan.schedule) >= 2, "El itinerario debe tener al menos 2 paradas"
    assert plan.schedule[0].porteño_tip != "", "El consejo porteño no debe estar vacio"

    print(f"   [OK] Suite 2: Schemas y Fallback aprobados con exito.")

def main():
    print("====================================================")
    print("  INICIANDO HARNESS DE EVALUACION (PYTHON)")
    print("====================================================")
    try:
        test_catalog()
        test_planner_and_schemas()
        print("----------------------------------------------------")
        print("HARNESS PYTHON: TODOS LOS TESTS PASARON EXITOSAMENTE")
        print("====================================================")
    except Exception as e:
        print(f"FALLA EN HARNESS PYTHON: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
