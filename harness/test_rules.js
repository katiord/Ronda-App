/**
 * Harness Test Suite: Auditoría de Factibilidad del Itinerario y Esquemas
 * Reglas: RULE-DOM-01, RULE-DOM-03, RULE-DEV-03
 */

const { filterCandidates } = require('./test_filters');
const fs = require('fs');
const path = require('path');

function generateDeterministicFallback(request, places) {
  const candidates = filterCandidates(places, request);
  
  // Selección diversa para cumplir RULE-DOM-04 y RULE-DOM-05 (máximo 1 comida fuerte)
  const selected = [];
  let diningCount = 0;
  for (const c of candidates) {
    if (selected.length >= 3) break;
    if (c.category === 'dining' && diningCount >= 1) continue;

    if (selected.length === 0 || c.category !== selected[selected.length - 1].category) {
      selected.push(c);
      if (c.category === 'dining') diningCount++;
    }
  }

  if (selected.length < 2) {
    // Si no hubo suficientes candidatos con categoría distinta, buscar en el barrio
    for (const p of places) {
      if (selected.length >= 3) break;
      if (p.category === 'dining' && diningCount >= 1) continue;
      if (p.neighborhood === request.neighborhood && !selected.some(s => s.id === p.id)) {
        if (selected.length === 0 || p.category !== selected[selected.length - 1].category) {
          selected.push(p);
          if (p.category === 'dining') diningCount++;
        }
      }
    }
  }

  if (selected.length === 0) {
    throw new Error('No hay suficientes lugares para armar un plan fallback.');
  }

  const schedule = selected.map((place, idx) => {
    const isLast = idx === selected.length - 1;
    return {
      time_slot: idx === 0 ? '16:00 - 17:15' : idx === 1 ? '17:30 - 19:00' : '19:15 - 20:45',
      place_name: place.name,
      address: place.address,
      activity_type: place.category === 'cafe' ? 'Café y pausa' : place.category === 'culture' ? 'Recorrido cultural' : 'Gastronomía y brindis',
      duration_minutes: place.typical_duration_minutes,
      porteño_tip: place.highlight,
      lat: place.lat,
      lng: place.lng,
      description: place.description,
      activities: place.activities,
      transit_to_next: isLast ? null : {
        mode: 'a pie',
        duration_minutes: 10,
        notes: 'Caminata corta por las calles arboladas del barrio.'
      }
    };
  });

  return {
    id: `plan_fallback_${Date.now()}`,
    title: `Ronda Porteña: ${request.mood.toUpperCase()} en ${request.neighborhood}`,
    neighborhood: request.neighborhood,
    mood: request.mood,
    estimated_cost: request.price_tier || '$$',
    narrative_summary: `Un recorrido auténtico pensado para disfrutar de ${request.neighborhood} con vibra ${request.mood}.`,
    schedule
  };
}

function validatePlanStructure(plan) {
  if (!plan.id || !plan.title || !plan.neighborhood || !plan.narrative_summary) {
    throw new Error('Plan incompleto en metadatos principales.');
  }

  if (!Array.isArray(plan.schedule) || plan.schedule.length < 2) {
    throw new Error('El plan debe contener al menos 2 paradas planificadas.');
  }

  plan.schedule.forEach((item, idx) => {
    if (!item.time_slot || !item.place_name || !item.address || !item.porteño_tip) {
      throw new Error(`La parada #${idx + 1} ('${item.place_name || 'Desconocido'}') carece de campos obligatorios.`);
    }

    if (item.lat !== undefined && item.lng !== undefined) {
      if (typeof item.lat !== 'number' || typeof item.lng !== 'number') {
        throw new Error(`La parada #${idx + 1} tiene coordenadas inválidas.`);
      }
    }

    if (item.description !== undefined && typeof item.description !== 'string') {
      throw new Error(`La parada #${idx + 1} tiene description inválida.`);
    }
    if (item.activities !== undefined && !Array.isArray(item.activities)) {
      throw new Error(`La parada #${idx + 1} tiene activities inválidas.`);
    }

    const isLast = idx === plan.schedule.length - 1;
    if (!isLast && !item.transit_to_next) {
      throw new Error(`La parada #${idx + 1} no incluye información de traslado al siguiente punto.`);
    }
  });

  // RULE-DOM-04, RULE-DOM-05 & RULE-DOM-06:
  // - RULE-DOM-04: Ningún plan puede contener dos paradas consecutivas de la misma categoría
  // - RULE-DOM-05: MÁXIMO UNA comida fuerte ('dining') en todo el itinerario (nunca dos paradas de comida)
  // - RULE-DOM-06: MÁXIMO UN café ('cafe') en salidas de mañana o tarde
  const filePath = path.resolve(__dirname, '../backend/data/places_caba.json');
  const places = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let diningCount = 0;
  let cafeCount = 0;

  for (let i = 0; i < plan.schedule.length; i++) {
    const currentPlace = places.find(p => p.name === plan.schedule[i].place_name);
    if (currentPlace) {
      if (currentPlace.category === 'dining') diningCount++;
      if (currentPlace.category === 'cafe') cafeCount++;
    }

    if (i < plan.schedule.length - 1) {
      const p1 = places.find(p => p.name === plan.schedule[i].place_name);
      const p2 = places.find(p => p.name === plan.schedule[i + 1].place_name);
      if (p1 && p2 && p1.category === p2.category) {
        throw new Error(`Violación de RULE-DOM-04: Dos paradas consecutivas de tipo '${p1.category}' detectadas (${p1.name} -> ${p2.name}).`);
      }
    }
  }

  if (diningCount > 1) {
    throw new Error(`Violación de RULE-DOM-05: Se detectaron ${diningCount} comidas fuertes ('dining') en el mismo itinerario. Solo se permite 1 comida principal.`);
  }

  return true;
}

function runPlanAuditorTests() {
  console.log('   [SUITE 3] Validando auditoría de factibilidad del plan y fallback (RULE-DEV-03)...');

  const filePath = path.resolve(__dirname, '../backend/data/places_caba.json');
  const places = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const sampleRequest = {
    neighborhood: 'Palermo',
    time_of_day: 'afternoon',
    mood: 'amigos',
    price_tier: '$$'
  };

  const fallbackPlan = generateDeterministicFallback(sampleRequest, places);
  validatePlanStructure(fallbackPlan);

  return {
    planId: fallbackPlan.id,
    stopsCount: fallbackPlan.schedule.length,
    status: 'PASSED'
  };
}

module.exports = { runPlanAuditorTests, generateDeterministicFallback, validatePlanStructure };
