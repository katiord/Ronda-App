/**
 * Harness Test Suite: Validación de Pre-filtrado y Presupuesto de Tokens
 * Reglas: RULE-TOK-02, RULE-DOM-02
 */

const fs = require('fs');
const path = require('path');

function filterCandidates(places, request) {
  return places.filter(place => {
    // Coincidencia de barrio si no es 'Cualquiera'
    if (request.neighborhood && request.neighborhood !== 'Cualquiera') {
      if (place.neighborhood.toLowerCase() !== request.neighborhood.toLowerCase()) {
        return false;
      }
    }

    // Coincidencia de horario si se especifica
    if (request.time_of_day && request.time_of_day !== 'full_day') {
      if (!place.recommended_times.includes(request.time_of_day)) {
        return false;
      }
    }

    // Coincidencia o compatibilidad de presupuesto
    if (request.price_tier) {
      if (request.price_tier === '$' && place.price_tier === '$$$') {
        return false; // Evitar mandar a lugares caros si el presupuesto es económico
      }
    }

    return true;
  });
}

function estimateTokens(text) {
  // Aproximación estándar: ~4 caracteres por token en prompts en español
  return Math.ceil(text.length / 4);
}

function runFilterAndTokenTests() {
  console.log('   [SUITE 2] Validando pre-filtrado y presupuesto de tokens (RULE-TOK-02)...');

  const filePath = path.resolve(__dirname, '../backend/data/places_caba.json');
  const places = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const testScenarios = [
    {
      name: 'Noche con amigos en Palermo',
      request: { neighborhood: 'Palermo', time_of_day: 'night', mood: 'amigos', price_tier: '$$' }
    },
    {
      name: 'Tarde cultural en Recoleta',
      request: { neighborhood: 'Recoleta', time_of_day: 'afternoon', mood: 'cultural', price_tier: '$' }
    },
    {
      name: 'Mañana tranquila en San Telmo',
      request: { neighborhood: 'San Telmo', time_of_day: 'morning', mood: 'tranquilo', price_tier: '$$' }
    }
  ];

  for (const scenario of testScenarios) {
    const candidates = filterCandidates(places, scenario.request);

    if (candidates.length === 0) {
      throw new Error(`Escenario '${scenario.name}' no devolvió ningún candidato viable.`);
    }

    // Limitar a top 6 para el prompt (tal como hace planner.py al enviar solo los campos esenciales)
    const cappedCandidates = candidates.slice(0, 6).map(p => ({
      name: p.name,
      address: p.address,
      neighborhood: p.neighborhood,
      category: p.category,
      vibe: p.vibe,
      highlight: p.highlight,
      duration_min: p.typical_duration_minutes
    }));
    const jsonPayload = JSON.stringify(cappedCandidates);
    const estimatedToks = estimateTokens(jsonPayload);

    // Regla de token budget estricta: < 1200 tokens
    if (estimatedToks > 1200) {
      throw new Error(`Exceso de tokens en escenario '${scenario.name}': ${estimatedToks} tokens (límite 1200).`);
    }
  }

  return {
    scenariosTested: testScenarios.length,
    status: 'PASSED'
  };
}

module.exports = { runFilterAndTokenTests, filterCandidates };
