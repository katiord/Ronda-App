import json
import sys
from pathlib import Path
from datetime import datetime, timedelta

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.app.schemas import PlanRequest
from backend.app.planner import ALL_PLACES, filter_candidates, generate_fallback_plan

BARRIOS = [
    "Palermo", "San Telmo", "Recoleta", "Chacarita", "Colegiales", "Belgrano",
    "San Nicolás", "Puerto Madero", "Caballito", "Almagro", "Villa Crespo"
]

TEST_TIMES = [
    ("morning", "09:30"),
    ("lunch", "13:00"),
    ("afternoon", "17:00"),
    ("night_dinner", "20:30"),
    ("night_late", "23:30"),
    ("madrugada_critica", "01:58")
]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MOODS = ["amigos", "pareja", "foodie", "cultural", "tranquilo", "solo"]

def parse_slot_hours(slot_str: str):
    try:
        parts = slot_str.split(" - ")
        start_p = parts[0].strip().split(":")
        end_p = parts[1].strip().split(":")
        start_h = int(start_p[0]) + int(start_p[1]) / 60.0
        end_h = int(end_p[0]) + int(end_p[1]) / 60.0
        if end_h < start_h:
            end_h += 24.0
        return start_h, end_h
    except Exception:
        return None, None

def run_comprehensive_audit():
    print("=" * 75)
    print("🔍 AUDITORÍA COMBINATORIA INTEGRAL DE RONDAS Y HORARIOS REALES (REVISOR QA)")
    print("=" * 75)

    name_to_place = {p.name.lower(): p for p in ALL_PLACES}
    for p in ALL_PLACES:
        name_to_place[p.id] = p

    total_scenarios = 0
    inconsistencies = []

    # Caso testigo 0: San Telmo 01:58 AM (Reporte Investigador y Usuario)
    test_cases_special = [
        ("San Telmo", "night", "01:58", "amigos", "monday", "CASO CRÍTICO SAN TELMO 01:58 AM (Lunes madrugada)")
    ]

    for barrio in BARRIOS:
        for tod_label, start_time in TEST_TIMES:
            for day in DAYS:
                for mood in MOODS:
                    total_scenarios += 1

                    tod_req = "night" if tod_label in ["night_dinner", "night_late", "madrugada_critica"] else (
                        "morning" if tod_label in ["morning", "lunch"] else "afternoon"
                    )

                    req = PlanRequest(
                        neighborhood=barrio,
                        time_of_day=tod_req,
                        mood=mood,
                        start_time=start_time,
                        price_tier="$$"
                    )

                    candidates = filter_candidates(req)
                    plan = generate_fallback_plan(req, candidates)

                    scenario_label = f"{barrio} | {day.upper()} | {tod_label} ({start_time}) | {mood}"
                    start_h_req = int(start_time.split(":")[0]) + int(start_time.split(":")[1]) / 60.0

                    # REGLA 1: Monoparada en madrugada profunda (01:00 a 05:00 AM)
                    if 1.0 <= start_h_req < 5.0:
                        if len(plan.schedule) > 1:
                            inconsistencies.append({
                                "type": "MADRUGADA_MULTIPARADA_INVALIDA",
                                "scenario": scenario_label,
                                "paradas": [s.place_name for s in plan.schedule],
                                "details": f"A las {start_time} generó {len(plan.schedule)} paradas. En trasnoche profunda (01:00-05:00) debe ser 1 única parada refugio."
                            })

                    # REGLA 2: No duplicar el mismo tipo de lugar en el mismo plan
                    categories_seen = []
                    subcategories_seen = []
                    for s in plan.schedule:
                        p = name_to_place.get(s.place_name.lower())
                        if p:
                            # Chequear si repite subcategorías idénticas (ej dos 'bar_notable', dos 'heladeria_artesanal')
                            for sub in p.subcategories:
                                if sub in ["bar_notable", "heladeria_artesanal", "speakeasy", "bodegon_clasico", "parrilla"]:
                                    if sub in subcategories_seen:
                                        inconsistencies.append({
                                            "type": "DUPLICACION_TIPO_LUGAR",
                                            "scenario": scenario_label,
                                            "place": s.place_name,
                                            "duplicated_subtype": sub,
                                            "details": f"El plan asignó dos veces el tipo '{sub}'. Paradas: {[x.place_name for x in plan.schedule]}"
                                        })
                                    subcategories_seen.append(sub)

                    # REGLA 3: Horarios reales y Buffer de Cierre según schedule_by_day
                    for stop_idx, s in enumerate(plan.schedule):
                        p = name_to_place.get(s.place_name.lower())
                        if not p:
                            continue

                        sched_by_day = getattr(p, "schedule_by_day", {}) or {}
                        day_info = sched_by_day.get(day.lower())

                        # A. Chequear si el día está cerrado
                        if day_info and day_info.get("is_closed", False):
                            inconsistencies.append({
                                "type": "LUGAR_CERRADO_POR_DIA",
                                "scenario": scenario_label,
                                "place": p.name,
                                "day": day,
                                "details": f"{p.name} está CERRADO los {day} según schedule_by_day (Google Maps)."
                            })
                        elif p.days_open and day.lower() not in [d.lower() for d in p.days_open]:
                            inconsistencies.append({
                                "type": "LUGAR_CERRADO_POR_DIA",
                                "scenario": scenario_label,
                                "place": p.name,
                                "day": day,
                                "details": f"{p.name} no abre los {day} (días abiertos: {p.days_open})."
                            })

                        # B. Chequear Buffer de Cierre y Horario del Slot
                        start_slot_h, end_slot_h = parse_slot_hours(s.time_slot)
                        if start_slot_h is not None and day_info:
                            open_h = day_info.get("open_hour") if day_info.get("open_hour") is not None else 0.0
                            close_h = day_info.get("close_hour") if day_info.get("close_hour") is not None else 24.0

                            # Ajustar trasnoche
                            start_eval = start_slot_h
                            if start_eval < 5.0 and open_h > 12.0:
                                start_eval += 24.0

                            # Buffer de cierre mínimo: el lugar debe cerrar al menos 45 min (0.75h) después de la llegada
                            min_buffer = 0.75
                            duration_h = s.duration_minutes / 60.0

                            if close_h is not None and close_h > 0:
                                # Si llega después del cierre o con menos de 45 min antes del cierre
                                if start_eval + min_buffer > close_h:
                                    inconsistencies.append({
                                        "type": "BUFFER_CIERRE_VIOLADO",
                                        "scenario": scenario_label,
                                        "place": p.name,
                                        "slot": s.time_slot,
                                        "details": f"Llegada {start_slot_h:.2f}h pero {p.name} cierra a las {close_h:.2f}h (buffer menor a 45 min o ya cerrado)."
                                    })
                                elif start_eval < open_h - 0.25:
                                    inconsistencies.append({
                                        "type": "LUGAR_CERRADO_POR_HORARIO",
                                        "scenario": scenario_label,
                                        "place": p.name,
                                        "slot": s.time_slot,
                                        "details": f"Slot {s.time_slot} asignado antes de la apertura ({open_h:.2f}h)."
                                    })

                    # REGLA 4: Sugerencias diurnas (ferias, museos) en salidas nocturnas
                    if tod_label in ["night_dinner", "night_late", "madrugada_critica"] and plan.suggested_activity:
                        sug = plan.suggested_activity
                        if sug and ("feria" in sug.category.lower() or "paseo" in sug.category.lower()):
                            inconsistencies.append({
                                "type": "SUGERENCIA_NOCTURNA_INCOMPATIBLE",
                                "scenario": scenario_label,
                                "sugerencia": sug.title,
                                "details": f"Sugiere '{sug.title}' ({sug.days}) en horario de noche ({start_time})."
                            })

    print(f"\n📊 Total de escenarios combinatorios evaluados: {total_scenarios}")
    print(f"🚨 Total de inconsistencias detectadas: {len(inconsistencies)}")

    by_type = {}
    for inc in inconsistencies:
        t = inc["type"]
        by_type.setdefault(t, []).append(inc)

    print("\n" + "=" * 50)
    print("DISTRIBUCIÓN DE INCONSISTENCIAS POR TIPO:")
    print("=" * 50)
    for t, items in by_type.items():
        print(f"🔸 {t}: {len(items)} violaciones")

    print("\n" + "=" * 50)
    print("CASOS DE PRUEBA TESTIGO (TOP FALLAS):")
    print("=" * 50)
    for t, items in by_type.items():
        print(f"\n[{t}] (Ejemplo):")
        for sample in items[:2]:
            print(f"  • Escenario: {sample['scenario']}")
            for k, v in sample.items():
                if k not in ["type", "scenario"]:
                    print(f"    {k}: {v}")

    # Guardar reporte estructurado para el Programador
    out_path = ROOT_DIR / "backend" / "data" / "audit_inconsistencies_report.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({
            "total_scenarios": total_scenarios,
            "total_inconsistencies": len(inconsistencies),
            "by_type": {t: len(items) for t, items in by_type.items()},
            "details": inconsistencies
        }, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Reporte exportado a: {out_path}")

if __name__ == "__main__":
    run_comprehensive_audit()
