const fs = require('fs');
const path = require('path');
const { filterCandidates } = require('./test_filters');
const { generateDeterministicFallback, validatePlanStructure } = require('./test_rules');

function runMultiScheduleAudits() {
  const filePath = path.resolve(__dirname, '../backend/data/places_caba.json');
  const places = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const testRequests = [
    { name: 'Almuerzo Recoleta', neighborhood: 'Recoleta', time_of_day: 'afternoon', mood: 'foodie', price_tier: '$$' },
    { name: 'Almuerzo San Telmo', neighborhood: 'San Telmo', time_of_day: 'afternoon', mood: 'foodie', price_tier: '$$' },
    { name: 'Almuerzo Belgrano', neighborhood: 'Belgrano', time_of_day: 'afternoon', mood: 'amigos', price_tier: '$$' },
    { name: 'Almuerzo Palermo', neighborhood: 'Palermo', time_of_day: 'afternoon', mood: 'pareja', price_tier: '$$' },
    { name: 'Almuerzo Chacarita', neighborhood: 'Chacarita', time_of_day: 'afternoon', mood: 'foodie', price_tier: '$$' },
    { name: 'Almuerzo Colegiales', neighborhood: 'Colegiales', time_of_day: 'afternoon', mood: 'tranquilo', price_tier: '$$' },

    { name: 'Mañana Palermo', neighborhood: 'Palermo', time_of_day: 'morning', mood: 'foodie', price_tier: '$$' },
    { name: 'Mañana Recoleta', neighborhood: 'Recoleta', time_of_day: 'morning', mood: 'tranquilo', price_tier: '$$' },
    { name: 'Mañana San Telmo', neighborhood: 'San Telmo', time_of_day: 'morning', mood: 'cultural', price_tier: '$$' },

    { name: 'Cena Recoleta', neighborhood: 'Recoleta', time_of_day: 'night', mood: 'pareja', price_tier: '$$$' },
    { name: 'Cena Palermo', neighborhood: 'Palermo', time_of_day: 'night', mood: 'amigos', price_tier: '$$' },
    { name: 'Cena Chacarita', neighborhood: 'Chacarita', time_of_day: 'night', mood: 'foodie', price_tier: '$$' },

    { name: 'Tarde San Nicolás', neighborhood: 'San Nicolás', time_of_day: 'afternoon', mood: 'cultural', price_tier: '$$' },
    { name: 'Tarde Puerto Madero', neighborhood: 'Puerto Madero', time_of_day: 'afternoon', mood: 'pareja', price_tier: '$$' },
    { name: 'Tarde Caballito', neighborhood: 'Caballito', time_of_day: 'afternoon', mood: 'tranquilo', price_tier: '$$' },
    { name: 'Noche Almagro', neighborhood: 'Almagro', time_of_day: 'night', mood: 'amigos', price_tier: '$$' },
    { name: 'Noche Villa Crespo', neighborhood: 'Villa Crespo', time_of_day: 'night', mood: 'amigos', price_tier: '$$' }
  ];

  let passed = 0;
  testRequests.forEach(req => {
    const plan = generateDeterministicFallback(req, places);
    validatePlanStructure(plan);

    // Auditoría de no duplicidad de comidas fuertes
    let diningCount = 0;
    plan.schedule.forEach(item => {
      const p = places.find(pl => pl.name === item.place_name);
      if (p && p.category === 'dining') diningCount++;
    });

    if (diningCount > 1) {
      throw new Error(`[AUDITOR] En escenario '${req.name}' se encontraron ${diningCount} comidas fuertes ('dining').`);
    }

    passed++;
  });

  return { totalTested: passed, status: 'ALL_PASSED' };
}

module.exports = { runMultiScheduleAudits };

if (require.main === module) {
  const res = runMultiScheduleAudits();
  console.log(`✅ Auditoría Multi-Horario Aprobada: ${res.totalTested} escenarios verificados sin doble comida.`);
}
