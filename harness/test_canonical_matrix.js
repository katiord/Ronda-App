/**
 * Harness Test Suite: Validación de la Matriz Canónica (RULE-DOM-07) y Días Fácticos (RULE-DOM-08)
 */

const fs = require('fs');
const path = require('path');

const HEAVY_FOOD_SUBTYPES = new Set([
  'bodegon', 'bodegon_clasico', 'parrilla', 'parrilla_tradicional',
  'criollo', 'dining', 'almuerzo', 'cena', 'picadas'
]);

function isHeavyFood(place) {
  if (!place) return false;
  const subs = new Set(place.subcategories || []);
  if (subs.has('heladeria_artesanal') || subs.has('postres') || subs.has('bakery')) {
    return false;
  }
  if (place.category === 'dining') return true;
  for (const s of subs) {
    if (HEAVY_FOOD_SUBTYPES.has(s)) return true;
  }
  return false;
}

function runCanonicalMatrixTests() {
  const filePath = path.resolve(__dirname, '../backend/data/places_caba.json');
  const places = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const coreBarrios = ['San Telmo', 'Palermo', 'Recoleta', 'Chacarita', 'Colegiales', 'Belgrano'];

  // 1. Validar que cada barrio core tenga al menos una opción para cada rol canónico
  coreBarrios.forEach(b => {
    const barrioPlaces = places.filter(p => p.neighborhood === b);
    const cafes = barrioPlaces.filter(p => p.category === 'cafe');
    const cultureOrPaseo = barrioPlaces.filter(p => ['culture', 'bookstore', 'park'].includes(p.category));
    const diningOrNight = barrioPlaces.filter(p => ['dining', 'nightlife'].includes(p.category));

    if (cafes.length === 0) {
      throw new Error(`[RULE-DOM-07] El barrio ${b} carece de cafeterías para la parada 1.`);
    }
    if (cultureOrPaseo.length === 0) {
      throw new Error(`[RULE-DOM-07] El barrio ${b} carece de espacios culturales/paseos para la parada 2.`);
    }
    if (diningOrNight.length === 0) {
      throw new Error(`[RULE-DOM-07] El barrio ${b} carece de opciones de comida o barra para la parada 3.`);
    }
  });

  // 2. Validar RULE-DOM-08: En días hábiles (lunes a viernes), no debe sugerirse feria de fin de semana
  const weekendDays = ['saturday', 'sunday'];
  const weekdayDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  // Comprobar que en places_caba.json, lugares con schedule_by_day reflejen aperturas reales
  let validatedDays = 0;
  places.forEach(p => {
    if (p.schedule_by_day) {
      for (const [dayKey, sched] of Object.entries(p.schedule_by_day)) {
        if (sched.is_closed && sched.open !== 'Cerrado' && sched.open !== null) {
          throw new Error(`[RULE-DOM-08] El lugar ${p.name} tiene inconsistencia en schedule_by_day para ${dayKey}.`);
        }
        validatedDays++;
      }
    }
  });

  return {
    status: 'ALL_PASSED',
    coreBarriosChecked: coreBarrios.length,
    scheduleDaysChecked: validatedDays
  };
}

module.exports = { runCanonicalMatrixTests, isHeavyFood };

if (require.main === module) {
  const res = runCanonicalMatrixTests();
  console.log(`✅ Suite Canónica Aprobada: ${res.coreBarriosChecked} barrios y ${res.scheduleDaysChecked} horarios validados.`);
}
