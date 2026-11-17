/**
 * Ronda — Investigador: Multi-source data extractor v3
 * Extrae og:image y meta description de las URLs de TripAdvisor ya capturadas.
 * Complementa con GCBA Turismo para atracciones conocidas.
 * No requiere Puppeteer - solo fetch HTTP.
 */
const fs = require('fs');
const path = require('path');

const taData = require('./tripadvisor_data.json');
const catalog = require('../backend/data/places_caba.json');
const OUTPUT_FILE = path.resolve(__dirname, 'places_enriched.json');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Known good direct image sources (GCBA Turismo, official sites)
const KNOWN_IMAGES = {
  'palermo_jardin_botanico': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/jardin_botanico_portada.jpg',
  'palermo_rosedal': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/rosedal_portada.jpg',
  'santelmo_mercado': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/mercado_de_san_telmo_portada.jpg',
  'santelmo_parque_lezama': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/parque_lezama_portada.jpg',
  'santelmo_mamba': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/mamba_portada.jpg',
  'recoleta_ateneo': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/el_ateneo_grand_splendid_portada.jpg',
  'recoleta_mnba': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/museo_bellas_artes_portada.jpg',
  'recoleta_ccr': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/centro_cultural_recoleta_portada.jpg',
  'recoleta_plaza_francia': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/cementerio_recoleta_portada.jpg',
  'recoleta_floralis': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/floralis_generica_portada.jpg',
  'chacarita_parque_andes': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/parque_los_andes_portada.jpg',
  'belgrano_barrancas': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/barrancas_de_belgrano_portada.jpg',
  'belgrano_museo_larreta': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/museo_larreta_portada.jpg',
  'belgrano_barrio_chino': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/barrio_chino_portada.jpg',
  'palermo_jardin_japones': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/jardin_japones_portada.jpg',
  'colegiales_mercado_pulgas': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/mercado_de_las_pulgas_portada.jpg',
};

async function fetchMeta(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    
    if (!res.ok) return null;
    const html = await res.text();
    
    // Extract og:image
    const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
      || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
    const ogImage = ogMatch ? ogMatch[1] : null;

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
      || html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"/i);
    const description = descMatch ? descMatch[1] : null;

    // Extract og:title for verification
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
      || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
    const ogTitle = titleMatch ? titleMatch[1] : null;

    return { ogImage, description, ogTitle };
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log(`\n🔍 RONDA — Multi-source Enricher v3`);
  console.log(`   ${taData.length} lugares\n`);

  const results = [];
  let enriched = 0;

  for (let i = 0; i < taData.length; i++) {
    const place = taData[i];
    console.log(`[${i + 1}/${taData.length}] ${place.name}`);

    const result = {
      id: place.id,
      name: place.name,
      neighborhood: place.neighborhood,
      address: place.address,
      ta_url: place.ta_url,
      image_url: null,
      image_source: null,
      about: null,
      og_title: null,
      features: [],
      found: false
    };

    // Source 1: Known GCBA/official images
    if (KNOWN_IMAGES[place.id]) {
      result.image_url = KNOWN_IMAGES[place.id];
      result.image_source = 'GCBA Turismo';
      console.log(`  [IMG] GCBA Turismo`);
    }

    // Source 2: TripAdvisor meta tags (og:image + description)
    if (place.ta_url) {
      const meta = await fetchMeta(place.ta_url);
      if (meta) {
        if (meta.ogImage && !result.image_url) {
          result.image_url = meta.ogImage;
          result.image_source = 'TripAdvisor';
          console.log(`  [IMG] TripAdvisor`);
        }
        if (meta.description) {
          result.about = meta.description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          console.log(`  [ABOUT] OK`);
        }
        if (meta.ogTitle) {
          result.og_title = meta.ogTitle;
        }
      } else {
        console.log(`  [TA] Blocked/timeout`);
      }
      await sleep(1000);
    }

    result.found = !!(result.image_url || result.about);
    if (result.found) enriched++;
    results.push(result);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  }

  console.log(`\n✅ ${enriched}/${taData.length} enriquecidos.`);
  console.log(`   Guardado: ${OUTPUT_FILE}`);

  const withImg = results.filter(r => r.image_url).length;
  const withAbout = results.filter(r => r.about).length;
  console.log(`   Imagenes: ${withImg} | About: ${withAbout}`);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
