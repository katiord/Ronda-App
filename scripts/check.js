#!/usr/bin/env node
/**
 * Script de validación de datos: data/schema.json y data/lugares.json
 * Valida que los lugares cumplan el nuevo esquema y restricciones exactas.
 */

const fs = require('fs');
const path = require('path');

function check() {
  console.log('🔍 Iniciando verificación de data/schema.json y data/lugares.json...');

  // Determinar ruta de data/ (admite ejecución desde la raíz o subdirectorios)
  const rootDir = fs.existsSync(path.resolve(__dirname, '../data'))
    ? path.resolve(__dirname, '..')
    : path.resolve(process.cwd());

  const schemaPath = path.resolve(rootDir, 'data/schema.json');
  const lugaresPath = path.resolve(rootDir, 'data/lugares.json');

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Error: No se encontró el archivo de esquema en: ${schemaPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(lugaresPath)) {
    console.error(`❌ Error: No se encontró el archivo de lugares en: ${lugaresPath}`);
    process.exit(1);
  }

  let schema;
  let lugares;

  try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } catch (err) {
    console.error(`❌ Error parseando ${schemaPath}: ${err.message}`);
    process.exit(1);
  }

  try {
    lugares = JSON.parse(fs.readFileSync(lugaresPath, 'utf8'));
  } catch (err) {
    console.error(`❌ Error parseando ${lugaresPath}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(lugares) || lugares.length === 0) {
    console.error('❌ Error: data/lugares.json debe contener un array no vacío de lugares.');
    process.exit(1);
  }

  const VALID_CATEGORIAS = new Set([
    'desayuno_merienda',
    'almuerzo',
    'actividad',
    'cena_bar',
    'recorrido'
  ]);

  const VALID_MOMENTOS = new Set([
    'manana',
    'mediodia',
    'tarde',
    'noche'
  ]);

  const VALID_TECHADO = new Set([
    'si',
    'no',
    'mixto'
  ]);

  const REQUIRED_FIELDS = [
    'id',
    'nombre',
    'barrio',
    'categoria',
    'momentos',
    'techado',
    'duracion_min',
    'costo_por_persona_ars',
    'horarios',
    'direccion',
    'fuente_url',
    'verificar'
  ];

  const ids = new Set();
  const errors = [];

  lugares.forEach((item, index) => {
    const prefix = `Lugar #${index + 1} (${item.id || 'sin id'}):`;

    // 1. Campos obligatorios presentes
    for (const field of REQUIRED_FIELDS) {
      if (!(field in item)) {
        errors.push(`${prefix} falta el campo obligatorio '${field}'`);
      }
    }

    // 2. ID
    if (typeof item.id !== 'string' || item.id.trim() === '') {
      errors.push(`${prefix} 'id' debe ser un string no vacío`);
    } else {
      if (ids.has(item.id)) {
        errors.push(`${prefix} ID duplicado '${item.id}'`);
      }
      ids.add(item.id);
    }

    // 3. Nombre
    if (typeof item.nombre !== 'string' || item.nombre.trim() === '') {
      errors.push(`${prefix} 'nombre' debe ser un string no vacío`);
    }

    // 4. Barrio
    if (typeof item.barrio !== 'string' || item.barrio.trim() === '') {
      errors.push(`${prefix} 'barrio' debe ser un string no vacío`);
    }

    // 5. Categoria (enum estricto)
    if (!VALID_CATEGORIAS.has(item.categoria)) {
      errors.push(
        `${prefix} 'categoria' inválida: '${item.categoria}'. Valores permitidos: ${Array.from(VALID_CATEGORIAS).join(', ')}`
      );
    }

    // 6. Momentos (array estricto)
    if (!Array.isArray(item.momentos) || item.momentos.length === 0) {
      errors.push(`${prefix} 'momentos' debe ser un array no vacío`);
    } else {
      for (const m of item.momentos) {
        if (!VALID_MOMENTOS.has(m)) {
          errors.push(
            `${prefix} momento inválido: '${m}'. Valores permitidos: ${Array.from(VALID_MOMENTOS).join(', ')}`
          );
        }
      }
    }

    // 7. Techado (enum estricto)
    if (!VALID_TECHADO.has(item.techado)) {
      errors.push(
        `${prefix} 'techado' inválido: '${item.techado}'. Valores permitidos: ${Array.from(VALID_TECHADO).join(', ')}`
      );
    }

    // 8. Duracion_min
    if (typeof item.duracion_min !== 'number' || !Number.isInteger(item.duracion_min) || item.duracion_min <= 0) {
      errors.push(`${prefix} 'duracion_min' debe ser un entero positivo mayor a 0`);
    }

    // 9. Costo_por_persona_ars (entero o null)
    if (item.costo_por_persona_ars !== null) {
      if (typeof item.costo_por_persona_ars !== 'number' || !Number.isInteger(item.costo_por_persona_ars) || item.costo_por_persona_ars < 0) {
        errors.push(`${prefix} 'costo_por_persona_ars' debe ser un entero mayor o igual a 0 o null`);
      }
    }

    // 10. Horarios (string o null)
    if (item.horarios !== null && typeof item.horarios !== 'string') {
      errors.push(`${prefix} 'horarios' debe ser un string o null`);
    }

    // 11. Direccion
    if (typeof item.direccion !== 'string' || item.direccion.trim() === '') {
      errors.push(`${prefix} 'direccion' debe ser un string no vacío`);
    }

    // 12. Fuente_url
    if (typeof item.fuente_url !== 'string') {
      errors.push(`${prefix} 'fuente_url' debe ser un string`);
    }

    // 13. Verificar (boolean)
    if (typeof item.verificar !== 'boolean') {
      errors.push(`${prefix} 'verificar' debe ser un booleano (true o false)`);
    }
  });

  if (errors.length > 0) {
    console.error(`\n❌ Se encontraron ${errors.length} errores de validación:`);
    errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  }

  console.log(`✅ Validación exitosa: ${lugares.length} lugares verificados correctamente.`);
  console.log('   - Campos validados: id, nombre, barrio, categoria, momentos, techado, duracion_min, costo_por_persona_ars, horarios, direccion, fuente_url, verificar.');
  console.log('   - Restricciones de categoria, momentos y techado: 100% CUMPLIDAS.');
  process.exit(0);
}

check();
