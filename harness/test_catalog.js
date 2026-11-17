/**
 * Harness Test Suite: Verificación e Integridad del Catálogo de CABA
 * Reglas: RULE-DOM-01, RULE-TOK-01
 */

const fs = require('fs');
const path = require('path');

function runCatalogTests() {
  const filePath = path.resolve(__dirname, '../backend/data/places_caba.json');
  console.log('   [SUITE 1] Validando catálogo: places_caba.json...');

  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo de catálogo no existe en: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const places = JSON.parse(raw);

  if (!Array.isArray(places) || places.length === 0) {
    throw new Error('El catálogo debe ser un array no vacío.');
  }

  const validNeighborhoods = ['Palermo', 'San Telmo', 'Recoleta', 'Chacarita', 'Colegiales', 'Belgrano', 'San Nicolás', 'Puerto Madero', 'Caballito', 'Almagro', 'Villa Crespo'];
  const validCategories = ['cafe', 'dining', 'nightlife', 'culture', 'park', 'bookstore'];
  const validPriceTiers = ['$', '$$', '$$$'];
  const validTimes = ['morning', 'afternoon', 'night'];

  const ids = new Set();
  const neighborhoodCounts = {};

  places.forEach((p, idx) => {
    // 1. ID único
    if (!p.id || typeof p.id !== 'string') {
      throw new Error(`Lugar #${idx} carece de un 'id' válido.`);
    }
    if (ids.has(p.id)) {
      throw new Error(`ID duplicado detectado: ${p.id}`);
    }
    ids.add(p.id);

    // 2. Nombre y Dirección
    if (!p.name || p.name.trim().length < 3) {
      throw new Error(`Lugar '${p.id}' tiene un nombre inválido.`);
    }
    if (!p.address || p.address.trim().length < 5) {
      throw new Error(`Lugar '${p.id}' no tiene dirección real en CABA.`);
    }

    // 3. Barrio válido
    if (!validNeighborhoods.includes(p.neighborhood)) {
      throw new Error(`Lugar '${p.id}' tiene un barrio no soportado: '${p.neighborhood}'. Válidos: ${validNeighborhoods.join(', ')}`);
    }
    neighborhoodCounts[p.neighborhood] = (neighborhoodCounts[p.neighborhood] || 0) + 1;

    // 4. Categoría válida
    if (!validCategories.includes(p.category)) {
      throw new Error(`Lugar '${p.id}' tiene categoría inválida: '${p.category}'.`);
    }

    // 5. Presupuesto
    if (!validPriceTiers.includes(p.price_tier)) {
      throw new Error(`Lugar '${p.id}' tiene price_tier inválido: '${p.price_tier}'.`);
    }

    // 6. Horarios recomendados
    if (!Array.isArray(p.recommended_times) || p.recommended_times.length === 0) {
      throw new Error(`Lugar '${p.id}' debe tener al menos un recommended_time.`);
    }
    p.recommended_times.forEach(t => {
      if (!validTimes.includes(t)) {
        throw new Error(`Lugar '${p.id}' tiene horario inválido: '${t}'.`);
      }
    });

    // 7. Duración y toque porteño
    if (typeof p.typical_duration_minutes !== 'number' || p.typical_duration_minutes <= 0) {
      throw new Error(`Lugar '${p.id}' debe tener una duración típica en minutos.`);
    }
    if (!p.highlight || p.highlight.trim().length < 15) {
      throw new Error(`Lugar '${p.id}' requiere un 'highlight' detallado.`);
    }

    // 8. Coordenadas válidas en CABA (RULE-DOM-01)
    if (typeof p.lat !== 'number' || typeof p.lng !== 'number') {
      throw new Error(`Lugar '${p.id}' carece de coordenadas numéricas (lat, lng).`);
    }
    if (p.lat < -34.75 || p.lat > -34.50 || p.lng < -58.60 || p.lng > -58.30) {
      throw new Error(`Lugar '${p.id}' tiene coordenadas fuera del perímetro de CABA: (${p.lat}, ${p.lng}).`);
    }

    // 9. Descripción y actividades para el modal de detalle
    if (!p.description || typeof p.description !== 'string' || p.description.trim().length < 25) {
      throw new Error(`Lugar '${p.id}' requiere una 'description' detallada (mínimo 25 caracteres).`);
    }
    if (!Array.isArray(p.activities) || p.activities.length < 3) {
      throw new Error(`Lugar '${p.id}' requiere al menos 3 'activities' sugeridas.`);
    }
    p.activities.forEach(act => {
      if (!act || typeof act !== 'string' || act.trim().length < 10) {
        throw new Error(`Lugar '${p.id}' contiene una actividad inválida o demasiado corta.`);
      }
    });
  });

  // Verificar balance mínimo por barrio (mínimo 4 lugares por barrio)
  for (const n of validNeighborhoods) {
    const count = neighborhoodCounts[n] || 0;
    if (count < 4) {
      throw new Error(`El barrio '${n}' tiene menos de 4 lugares (${count}). Se requiere balance.`);
    }
  }

  return {
    totalPlaces: places.length,
    neighborhoods: neighborhoodCounts,
    status: 'PASSED'
  };
}

module.exports = { runCatalogTests };
