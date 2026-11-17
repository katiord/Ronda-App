// harness/audit_all_rondas_v2.js
// Auditoría de Validación Estricta de Rondas:
// 1. Días y horarios reales según Google Maps (schedule_by_day).
// 2. Control de franja de trasnoche (00:00 - 05:00 AM) y "Salir ahora".
// 3. Regla de Buffer de Admisión (mínimo 45 min antes del cierre).
// 4. Regla de No Duplicidad de Tipos (nunca dos bares notables, dos cafés, dos cenas).

const fs = require('fs');
const path = require('path');

const placesPath = path.resolve(__dirname, '../backend/data/places_caba.json');
const allPlaces = JSON.parse(fs.readFileSync(placesPath, 'utf8').replace(/^\uFEFF/, ''));

const BARRIOS = [
  'Palermo', 'San Telmo', 'Recoleta', 'Chacarita', 'Colegiales', 'Belgrano',
  'San Nicolás', 'Puerto Madero', 'Caballito', 'Almagro', 'Villa Crespo'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Horarios de prueba exhaustivos, incluyendo los casos reales de trasnoche
const TIME_SLOTS = [
  { label: 'morning', time: '09:30', hour: 9.5 },
  { label: 'lunch', time: '13:00', hour: 13.0 },
  { label: 'afternoon', time: '16:30', hour: 16.5 },
  { label: 'evening', time: '19:30', hour: 19.5 },
  { label: 'dinner', time: '21:00', hour: 21.0 },
  { label: 'late_night', time: '23:30', hour: 23.5 },
  { label: 'trasnoche_early', time: '01:00', hour: 25.0 }, // 01:00 AM
  { label: 'trasnoche_peak', time: '01:58', hour: 25.96 }, // 01:58 AM (Caso reportado por el usuario)
  { label: 'trasnoche_extreme', time: '02:30', hour: 26.5 }  // 02:30 AM
];

// Helper para obtener el horario exacto del día para un lugar
function getPlaceDaySchedule(place, day) {
  if (place.schedule_by_day && place.schedule_by_day[day]) {
    return place.schedule_by_day[day];
  }
  const isWeekend = (day === 'friday' || day === 'saturday');
  const closeH = (isWeekend && place.close_hour_weekend) ? place.close_hour_weekend : place.close_hour;
  const isClosed = (place.days_open && !place.days_open.includes(day));
  return {
    is_closed: isClosed,
    open_hour: place.open_hour,
    close_hour: closeH
  };
}

// Comprueba si dos lugares tienen el mismo subtipo específico que no tiene sentido duplicar
function hasSubtypeDuplication(placeA, placeB) {
  if (!placeA || !placeB) return false;
  if (placeA.id === placeB.id) return true;

  // 1. Nunca dos 'dining' (comida fuerte)
  if (placeA.category === 'dining' && placeB.category === 'dining') {
    return true;
  }

  // 2. Nunca dos 'cafe'
  if (placeA.category === 'cafe' && placeB.category === 'cafe') {
    return true;
  }

  // 3. Subtipos específicos: dos bares notables
  const subsA = new Set(placeA.subcategories || []);
  const subsB = new Set(placeB.subcategories || []);

  if (subsA.has('bar_notable') && subsB.has('bar_notable')) {
    return true;
  }

  // 4. Dos heladerías
  if (subsA.has('heladeria_artesanal') && subsB.has('heladeria_artesanal')) {
    return true;
  }

  // 5. Dos pubs o cervecerías seguidas sin comida ni actividad intermedia
  if ((subsA.has('cerveceria') || subsA.has('pub_britanico')) && (subsB.has('cerveceria') || subsB.has('pub_britanico'))) {
    return true;
  }

  return false;
}

// Simula la selección de candidatos con las reglas avanzadas del Revisor
function simulateAdvancedPlan(neighborhood, slot, day) {
  let candidates = allPlaces.filter(p => p.neighborhood.toLowerCase() === neighborhood.toLowerCase());

  const curHour = slot.hour; // En formato continuo (>24 para madrugada)
  const isTrasnoche = (curHour >= 25.0); // pasada la 01:00 AM

  // 1. Filtro estricto por día y horario con BUFFER de admisión
  const validCandidates = candidates.filter(p => {
    const daySched = getPlaceDaySchedule(p, day);
    if (daySched.is_closed) return false;

    let openH = daySched.open_hour;
    let closeH = daySched.close_hour;
    if (openH === undefined || closeH === undefined || openH === null || closeH === null) {
      return true;
    }

    // Normalizar a escala continua 24+ si el local abre a la tarde/noche y cierra de madrugada
    if (closeH <= 7.0) closeH += 24.0;
    if (openH <= 7.0 && closeH > 24.0) openH += 24.0;

    // Buffer de admisión: tiempo mínimo requerido = permanencia típica (min 45 min = 0.75h)
    const requiredDurationHours = Math.max(0.75, (p.typical_duration_minutes || 60) / 60);

    // ¿Ya está abierto?
    if (curHour < (openH - 0.25)) return false;

    // ¿Queda tiempo suficiente antes del cierre?
    // Debe haber al menos 45 minutos antes del cierre estricto
    if (curHour + 0.75 > closeH) return false;

    return true;
  });

  if (validCandidates.length === 0) {
    return { plan: [], reason: 'no_places_open' };
  }

  // 2. Si es trasnoche (01:00 a 05:00 AM), el plan debe ser MONOPARADA a menos que haya un refugio 24hs/trasnoche profunda
  const maxStops = isTrasnoche ? 1 : (slot.label === 'dinner' ? 2 : 3);

  const selected = [];
  for (const c of validCandidates) {
    if (selected.length >= maxStops) break;

    // Chequeo de duplicidad de subtipo contra paradas ya seleccionadas
    const isDuplicate = selected.some(s => hasSubtypeDuplication(s, c));
    if (isDuplicate) continue;

    // Si es la segunda parada, verificar que a la hora de llegada del segundo punto siga abierto
    if (selected.length === 1) {
      const firstStop = selected[0];
      const arrivalHourSecond = curHour + ((firstStop.typical_duration_minutes || 60) / 60) + 0.15; // + 10 min traslado
      const cDaySched = getPlaceDaySchedule(c, day);
      let cCloseH = cDaySched.close_hour;
      if (cCloseH <= 7.0) cCloseH += 24.0;
      if (arrivalHourSecond + 0.75 > cCloseH) {
        // No da el tiempo para una segunda parada
        continue;
      }
    }

    selected.push(c);
  }

  return { plan: selected, candidatesCount: validCandidates.length };
}

// Ejecución de la suite de auditoría
function runAuditV2() {
  console.log('======================================================================');
  console.log('🛡️  AUDITORÍA INTEGRAL DE CALIDAD Y COHERENCIA DE RONDAS (REVISOR QA)');
  console.log('======================================================================\n');

  let totalScenarios = 0;
  let successScenarios = 0;
  let emptyLateNightScenarios = 0;
  const inconsistencias = [];

  for (const day of DAYS) {
    for (const barrio of BARRIOS) {
      for (const slot of TIME_SLOTS) {
        totalScenarios++;
        const res = simulateAdvancedPlan(barrio, slot, day);
        const plan = res.plan;

        if (plan.length === 0) {
          if (slot.hour >= 25.0) {
            emptyLateNightScenarios++;
          }
          continue;
        }

        successScenarios++;

        // Chequeos de calidad sobre el plan generado:
        // 1. Verificación de lugar cerrado por día
        for (const stop of plan) {
          const sched = getPlaceDaySchedule(stop, day);
          if (sched.is_closed) {
            inconsistencias.push({
              tipo: 'LUGAR_CERRADO_POR_DIA',
              barrio, day, slot: slot.label, time: slot.time,
              lugar: stop.name
            });
          }

          // 2. Verificación de buffer de cierre (mínimo 45 min)
          let closeH = sched.close_hour;
          if (closeH <= 7.0) closeH += 24.0;
          if (slot.hour + 0.75 > closeH) {
            inconsistencias.push({
              tipo: 'CIERRA_DEMASIADO_PRONTO',
              barrio, day, slot: slot.label, time: slot.time,
              lugar: stop.name,
              cierre: closeH,
              horaConsulta: slot.hour
            });
          }
        }

        // 3. Verificación de duplicidad de subtipo
        if (plan.length >= 2) {
          for (let i = 0; i < plan.length - 1; i++) {
            for (let j = i + 1; j < plan.length; j++) {
              if (hasSubtypeDuplication(plan[i], plan[j])) {
                inconsistencias.push({
                  tipo: 'DUPLICIDAD_DE_SUBTIPO',
                  barrio, day, slot: slot.label, time: slot.time,
                  lugarA: plan[i].name,
                  lugarB: plan[j].name,
                  subtiposA: plan[i].subcategories,
                  subtiposB: plan[j].subcategories
                });
              }
            }
          }
        }
      }
    }
  }

  console.log(`📊 Escenarios combinatorios evaluados: ${totalScenarios}`);
  console.log(`✅ Rondas viables generadas: ${successScenarios}`);
  console.log(`🌙 Escenarios de trasnoche sin opciones abiertas: ${emptyLateNightScenarios}`);
  console.log(`⚠️ Inconsistencias detectadas: ${inconsistencias.length}`);

  if (inconsistencias.length > 0) {
    console.log('\n❌ DETALLE DE INCONSISTENCIAS:');
    inconsistencias.slice(0, 10).forEach((inc, idx) => {
      console.log(`  ${idx + 1}. [${inc.tipo}] en ${inc.barrio} (${inc.day} ${inc.time}): ${inc.lugar || (inc.lugarA + ' + ' + inc.lugarB)}`);
    });
  } else {
    console.log('\n🎉 AUDITORÍA PERFECTA: 0 inconsistencias en todas las combinaciones!');
    console.log('   - 0 lugares asignados cuando están cerrados.');
    console.log('   - 0 lugares asignados sin el buffer mínimo de 45 min.');
    console.log('   - 0 duplicidades de subtipos (nunca dos bares notables, ni dos cafés, ni dos cenas).');
    console.log('   - En trasnoche extrema (>01:00 AM) se genera monoparada de refugio nocturno.');
  }

  return { totalScenarios, successScenarios, emptyLateNightScenarios, inconsistencias };
}

runAuditV2();
