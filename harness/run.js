#!/usr/bin/env node
/**
 * Ronda Multi-Agent Verification Harness
 * Ejecuta todas las suites de validación contra las reglas definidas en RULES.md
 */

const { runCatalogTests } = require('./test_catalog');
const { runFilterAndTokenTests } = require('./test_filters');
const { runPlanAuditorTests } = require('./test_rules');
const { runMultiScheduleAudits } = require('./test_multi_schedule_audit');
const { runCanonicalMatrixTests } = require('./test_canonical_matrix');

function runAll() {
  console.log('====================================================');
  console.log('  🎯 INICIANDO RONDA EVALUATION & QA HARNESS');
  console.log('====================================================');

  const startTime = Date.now();
  const results = {};

  try {
    results.catalog = runCatalogTests();
    console.log(`   ✅ Suite 1 Aprobada: ${results.catalog.totalPlaces} lugares verificados.`);

    results.filters = runFilterAndTokenTests();
    console.log(`   ✅ Suite 2 Aprobada: ${results.filters.scenariosTested} escenarios evaluados dentro del presupuesto de tokens.`);

    results.auditor = runPlanAuditorTests();
    console.log(`   ✅ Suite 3 Aprobada: Fallback y factibilidad de itinerario verificados.`);

    results.multiSchedule = runMultiScheduleAudits();
    console.log(`   ✅ Suite 4 Aprobada: ${results.multiSchedule.totalTested} escenarios multi-horario auditados (RULE-DOM-05 y RULE-DOM-06 sin duplicidad gastronómica).`);

    results.canonical = runCanonicalMatrixTests();
    console.log(`   ✅ Suite 5 Aprobada: ${results.canonical.coreBarriosChecked} barrios validados con matriz canónica (RULE-DOM-07) y días fácticos (RULE-DOM-08).`);

    const duration = Date.now() - startTime;
    console.log('----------------------------------------------------');
    console.log(`🎉 HARNESS STATUS: TODOS LOS TESTS PASARON EXITOSAMENTE (${duration}ms)`);
    console.log('   Cumplimiento de reglas: [RULE-DOM-01..08, RULE-TOK-01..03, RULE-DEV-01..03]');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('----------------------------------------------------');
    console.error('❌ ERROR EN EL HARNESS:');
    console.error(`   ${err.message}`);
    console.error('----------------------------------------------------');
    process.exit(1);
  }
}

runAll();
