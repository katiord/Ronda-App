const fs = require('fs');
const path = require('path');

const placesPath = path.resolve(__dirname, '../backend/data/places_caba.json');
const schedulesPath = path.resolve(__dirname, '../backend/data/places_schedules_verified.json');

const allPlaces = JSON.parse(fs.readFileSync(placesPath, 'utf8').replace(/^\uFEFF/, ''));
const schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf8').replace(/^\uFEFF/, ''));
const scheduleMap = new Map(schedules.map(s => [s.id, s]));

const BARRIOS = [
  'Palermo', 'San Telmo', 'Recoleta', 'Chacarita', 'Colegiales', 'Belgrano',
  'San Nicolás', 'Puerto Madero', 'Caballito', 'Almagro', 'Villa Crespo'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_SLOTS = [
  { label: 'morning', time: '09:30', hour: 9.5 },
  { label: 'lunch', time: '13:00', hour: 13.0 },
  { label: 'afternoon', time: '17:00', hour: 17.0 },
  { label: 'night', time: '20:30', hour: 20.5 },
  { label: 'late_night', time: '23:30', hour: 23.5 }
];
const MOODS = ['amigos', 'pareja', 'foodie', 'cultural', 'tranquilo', 'solo'];

// Simulación de selección según la lógica del planificador
function simulatePlan(neighborhood, timeSlot, mood, day) {
  let candidates = allPlaces.filter(p => p.neighborhood.toLowerCase() === neighborhood.toLowerCase());
  
  // 1. Filtro estricto por día de apertura (RULE-DOM-02)
  candidates = candidates.filter(p => {
    if (!p.days_open || p.days_open.length === 0) return true;
    return p.days_open.map(d => d.toLowerCase()).includes(day.toLowerCase());
  });

  // 2. Filtro estricto por horario de atención (RULE-DOM-02)
  candidates = candidates.filter(p => {
    if (p.open_hour === undefined || p.close_hour === undefined) return true;
    let curH = timeSlot.hour;
    const openH = p.open_hour;
    const closeH = p.close_hour;
    if (curH < 5.0 && openH > 12.0) {
      curH += 24.0;
    }
    return (curH >= (openH - 0.25) && curH < closeH);
  });

  // 3. Filtro por momento del día
  if (timeSlot.label === 'night' || timeSlot.label === 'late_night') {
    candidates = candidates.filter(p => p.recommended_times.includes('night'));
  } else if (timeSlot.label === 'morning' || timeSlot.label === 'lunch') {
    candidates = candidates.filter(p => p.recommended_times.includes('morning') || p.category === 'dining');
  } else {
    candidates = candidates.filter(p => p.recommended_times.includes('afternoon'));
  }

  // 4. Secuencia nocturna porteña: cena primero, copas/bar después
  let selected = candidates.slice(0, 3);
  if ((timeSlot.label === 'night' || timeSlot.label === 'late_night') && selected.length >= 2) {
    const hasDining = selected.some(s => s.category === 'dining');
    const hasNightlife = selected.some(s => s.category === 'nightlife');
    if (hasDining && hasNightlife) {
      selected.sort((a, b) => (a.category === 'dining' ? -1 : 1));
    }
  }

  return selected;
}

function runAudit() {
  console.log('======================================================================');
  console.log('🚀 INICIANDO AUDITORÍA COMBINATORIA INTEGRAL DE RONDAS (REVISOR QA)');
  console.log('======================================================================\n');

  let totalScenarios = 0;
  const inconsistencies = [];

  for (const day of DAYS) {
    for (const barrio of BARRIOS) {
      for (const slot of TIME_SLOTS) {
        for (const mood of MOODS) {
          totalScenarios++;
          const scenarioKey = `${barrio} | ${day.toUpperCase()} | ${slot.label} (${slot.time}) | ${mood}`;
          const planStops = simulatePlan(barrio, slot, mood, day);

          for (const stop of planStops) {
            const sched = scheduleMap.get(stop.id);
            if (!sched) continue;

            // 1. Verificar día de apertura
            const daysOpen = (sched.days_open || []).map(d => d.toLowerCase());
            if (!daysOpen.includes(day)) {
              inconsistencies.push({
                type: 'LUGAR_CERRADO_POR_DIA',
                scenario: scenarioKey,
                place: stop.name,
                day,
                details: `${stop.name} (${stop.neighborhood}) cierra los ${day.toUpperCase()}. Horario: ${sched.horarios_detallados}`
              });
            }

            // 2. Verificar franja horaria
            const openH = sched.open_hour ?? 0;
            let closeH = sched.close_hour ?? 24;
            let currentH = slot.hour;

            if (currentH < 5.0 && openH > 12.0) {
              currentH += 24.0;
            }

            const isBeforeOpen = currentH < (openH - 0.25);
            const isAfterClose = currentH >= closeH;

            if (isBeforeOpen || isAfterClose) {
              inconsistencies.push({
                type: 'LUGAR_CERRADO_POR_HORARIO',
                scenario: scenarioKey,
                place: stop.name,
                slot: slot.time,
                details: `${stop.name} abre de ${openH}:00 a ${closeH}:00 hs. Fuera de rango para salida de las ${slot.time} hs.`
              });
            }
          }

          // 3. Verificar secuencia nocturna
          if ((slot.label === 'night' || slot.label === 'late_night') && planStops.length >= 2) {
            const first = planStops[0];
            const second = planStops[1];
            const isFirstBar = first.category === 'nightlife' || (first.subcategories || []).includes('bar');
            const isSecondDinner = second.category === 'dining' || (second.subcategories || []).includes('heladeria_artesanal');
            
            if (isFirstBar && isSecondDinner) {
              inconsistencies.push({
                type: 'SECUENCIA_NOCTURNA_INVERTIDA',
                scenario: scenarioKey,
                place: `${first.name} -> ${second.name}`,
                details: `Envía a tomar copas a ${first.name} y luego a cenar/helado a ${second.name}. En CABA el bar es cierre.`
              });
            }
          }
        }
      }
    }
  }

  // Agrupamiento por tipo
  const byType = {};
  for (const inc of inconsistencies) {
    byType[inc.type] = (byType[inc.type] || 0) + 1;
  }

  console.log(`📊 Total de escenarios combinatorios auditados: ${totalScenarios}`);
  console.log(`⚠️ Total de inconsistencias detectadas: ${inconsistencies.length}\n`);

  console.log('==================================================');
  console.log('RESUMEN DE INCONSISTENCIAS DETECTADAS POR TIPO:');
  console.log('==================================================');
  for (const [t, count] of Object.entries(byType)) {
    console.log(`🔸 ${t}: ${count} casos`);
  }

  console.log('\n==================================================');
  console.log('EJEMPLOS REALES DE INCONSISTENCIAS IDENTIFICADAS:');
  console.log('==================================================');
  
  const sampleClosedDays = inconsistencies.filter(x => x.type === 'LUGAR_CERRADO_POR_DIA').slice(0, 5);
  console.log('\n[1. LUGARES CERRADOS POR DÍA (Lunes, Martes o Domingos)]:');
  sampleClosedDays.forEach(s => {
    console.log(`  • ${s.place} en ${s.scenario}`);
    console.log(`    Detalle: ${s.details}`);
  });

  const sampleClosedHours = inconsistencies.filter(x => x.type === 'LUGAR_CERRADO_POR_HORARIO').slice(0, 5);
  console.log('\n[2. LUGARES CERRADOS POR HORA (Apertura tardía o cierre temprano)]:');
  sampleClosedHours.forEach(s => {
    console.log(`  • ${s.place} en ${s.scenario}`);
    console.log(`    Detalle: ${s.details}`);
  });

  const sampleInverted = inconsistencies.filter(x => x.type === 'SECUENCIA_NOCTURNA_INVERTIDA').slice(0, 3);
  console.log('\n[3. SECUENCIA NOCTURNA INVERTIDA]:');
  sampleInverted.forEach(s => {
    console.log(`  • ${s.place} en ${s.scenario}`);
    console.log(`    Detalle: ${s.details}`);
  });

  // Guardar archivo JSON
  const outPath = path.resolve(__dirname, '../backend/data/audit_inconsistencies_report.json');
  fs.writeFileSync(outPath, JSON.stringify({
    totalScenarios,
    totalInconsistencies: inconsistencies.length,
    byType,
    inconsistencies: inconsistencies.slice(0, 100)
  }, null, 2), 'utf8');

  console.log(`\n📁 Reporte consolidado exportado en: ${outPath}`);
}

runAudit();
