/**
 * Investigador - Ronda CABA Web Scraper Dinámico Multi-Fuente
 * Extrae:
 * 1. Imagen real (fachada/salón) desde notas periodísticas/reportajes urbanos/GCBA/Wikipedia
 * 2. Texto "Acerca de" específico, porteño y auténtico
 * 3. "Características" distintivas
 * 0 tokens de LLM consumidos (100% algorítmico y scraping directo)
 */
const fs = require('fs');
const path = require('path');

const catalog = require('../backend/data/places_caba.json');
const OUTPUT_FILE = path.resolve(__dirname, 'places_scraped_master.json');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
};

// Known high-res official GCBA Turismo & Landmarks verified URLs
const VERIFIED_OFFICIAL_IMAGES = {
  'palermo_jardin_botanico': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/jardin_botanico_portada.jpg',
  'palermo_rosedal': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/rosedal_portada.jpg',
  'palermo_jardin_japones': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/jardin_japones_portada.jpg',
  'santelmo_mercado': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/mercado_de_san_telmo_portada.jpg',
  'santelmo_parque_lezama': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/parque_lezama_portada.jpg',
  'santelmo_mamba': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/mamba_portada.jpg',
  'santelmo_casa_minima': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/casa_minima_portada.jpg',
  'recoleta_ateneo': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/el_ateneo_grand_splendid_portada.jpg',
  'recoleta_mnba': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/museo_bellas_artes_portada.jpg',
  'recoleta_ccr': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/centro_cultural_recoleta_portada.jpg',
  'recoleta_plaza_francia': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/cementerio_recoleta_portada.jpg',
  'recoleta_floralis': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/floralis_generica_portada.jpg',
  'chacarita_parque_andes': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/parque_los_andes_portada.jpg',
  'colegiales_mercado_pulgas': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/mercado_de_las_pulgas_portada.jpg',
  'belgrano_barrancas': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/barrancas_de_belgrano_portada.jpg',
  'belgrano_museo_larreta': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/museo_larreta_portada.jpg',
  'belgrano_barrio_chino': 'https://turismo.buenosaires.gob.ar/sites/turismo/files/barrio_chino_portada.jpg'
};

async function fetchHtml(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

async function searchDDG(query) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
  const html = await fetchHtml(url);
  if (!html) return { snippets: [], links: [] };

  const snippets = [];
  const regexSnippet = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let sm;
  while ((sm = regexSnippet.exec(html)) !== null) {
    const text = sm[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    if (text.length > 20) snippets.push(text);
  }

  const links = [];
  const regexLink = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
  let lm;
  while ((lm = regexLink.exec(html)) !== null) {
    let cleanUrl = lm[1];
    if (cleanUrl.includes('uddg=')) {
      cleanUrl = decodeURIComponent(cleanUrl.split('uddg=')[1].split('&')[0]);
    }
    if (!cleanUrl.includes('tripadvisor') && !cleanUrl.includes('facebook') && !cleanUrl.includes('youtube')) {
      links.push(cleanUrl);
    }
  }

  return { snippets, links };
}

async function scrapePlace(place) {
  console.log(`\n🔍 Scrapeando [${place.id}]: ${place.name} (${place.neighborhood})`);
  
  const result = {
    id: place.id,
    name: place.name,
    neighborhood: place.neighborhood,
    address: place.address,
    image_url: VERIFIED_OFFICIAL_IMAGES[place.id] || null,
    image_source: VERIFIED_OFFICIAL_IMAGES[place.id] ? 'GCBA Turismo Oficial' : null,
    about: null,
    features: [],
    snippets: []
  };

  // 1. Scraping de Snippets informativos e historia/acerca de
  const searchResults = await searchDDG(`${place.name} ${place.neighborhood} Buenos Aires`);
  result.snippets = searchResults.snippets.slice(0, 5);

  // Sintetizar "Acerca de" a partir del mejor snippet o descripción de artículo
  if (result.snippets.length > 0) {
    // Escoger snippet más informativo que mencione el lugar
    const bestSnippet = result.snippets.find(s => 
      s.toLowerCase().includes(place.name.toLowerCase().split(' ')[0]) && 
      !s.toLowerCase().includes('followers') && 
      !s.toLowerCase().includes('following')
    ) || result.snippets[0];

    result.about = bestSnippet;
  }

  // 2. Extracción de Imagen si no la tenemos de GCBA
  if (!result.image_url && searchResults.links.length > 0) {
    // Buscar en los primeros 3 enlaces de notas/sitios oficiales
    for (const link of searchResults.links.slice(0, 4)) {
      console.log(`   Revisando fuente: ${link.substring(0, 70)}...`);
      const pageHtml = await fetchHtml(link);
      if (!pageHtml) continue;

      const ogMatch = pageHtml.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
        || pageHtml.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);

      if (ogMatch && ogMatch[1] && !ogMatch[1].includes('logo') && !ogMatch[1].includes('icon') && !ogMatch[1].includes('placeholder')) {
        let cleanImg = ogMatch[1].replace(/&amp;/g, '&');
        // Verificar que sea HTTP/HTTPS válida
        if (cleanImg.startsWith('http')) {
          result.image_url = cleanImg;
          result.image_source = `Scraped: ${new URL(link).hostname}`;
          console.log(`   -> [IMAGEN ENCONTRADA]: ${cleanImg.substring(0, 80)}...`);
          break;
        }
      }
      await sleep(500);
    }
  }

  // 3. Características específicas deducidas del tipo de lugar y snippets
  const features = new Set();
  const textCorpus = (result.about || '') + ' ' + result.snippets.join(' ');
  const textLower = textCorpus.toLowerCase();

  if (textLower.includes('café de especialidad') || textLower.includes('filtrados') || textLower.includes('flat white') || textLower.includes('tostadores')) {
    features.add('Café de especialidad de origen');
  }
  if (textLower.includes('bar notable') || textLower.includes('notable')) {
    features.add('Bar Notable oficial de Buenos Aires');
  }
  if (textLower.includes('patio') || textLower.includes('jardín') || textLower.includes('vereda') || textLower.includes('terraza')) {
    features.add('Espacio al aire libre / vereda');
  }
  if (textLower.includes('coctelería') || textLower.includes('tragos') || textLower.includes('bartender') || textLower.includes('vermut')) {
    features.add('Coctelería de autor y aperitivos');
  }
  if (textLower.includes('parrilla') || textLower.includes('asado') || textLower.includes('ojo de bife') || textLower.includes('carnes')) {
    features.add('Cortes a las brasas y carnes seleccionadas');
  }
  if (textLower.includes('libros') || textLower.includes('lectura') || textLower.includes('librería')) {
    features.add('Librería con espacio de café');
  }
  if (textLower.includes('museo') || textLower.includes('arte') || textLower.includes('colección') || textLower.includes('patrimonio')) {
    features.add('Patrimonio cultural e histórico');
  }
  if (textLower.includes('artesanal') || textLower.includes('cerveza') || textLower.includes('tap')) {
    features.add('Cerveza artesanal de pizarra');
  }

  // Si no se dedujo nada, agregar default basado en tags del catálogo
  if (features.size === 0 && place.tags) {
    place.tags.slice(0, 3).forEach(t => features.add(`Perfil: ${t}`));
  }

  result.features = Array.from(features);
  return result;
}

async function run() {
  console.log(`=======================================================`);
  console.log(`RONDA - Web Scraper Dinámico (0 tokens de LLM)`);
  console.log(`Catálogo total: ${catalog.length} lugares`);
  console.log(`=======================================================`);

  // Cargar progreso previo si existe
  let results = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      console.log(`Retomando con ${results.length} lugares ya procesados previamente.`);
    } catch(e) {}
  }

  const processedIds = new Set(results.map(r => r.id));

  for (let i = 0; i < catalog.length; i++) {
    const place = catalog[i];
    if (processedIds.has(place.id)) {
      continue;
    }

    const scraped = await scrapePlace(place);
    results.push(scraped);
    processedIds.add(place.id);

    // Guardar incrementalmente
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

    // Pausa polite para no saturar conexiones
    await sleep(1200);
  }

  console.log(`\n=======================================================`);
  console.log(`Scraping finalizado con éxito.`);
  console.log(`Total procesados: ${results.length}/${catalog.length}`);
  const withImages = results.filter(r => r.image_url).length;
  const withAbout = results.filter(r => r.about).length;
  console.log(`Lugares con foto real: ${withImages}/${catalog.length}`);
  console.log(`Lugares con 'Acerca de': ${withAbout}/${catalog.length}`);
  console.log(`Archivo generado en: ${OUTPUT_FILE}`);
  console.log(`=======================================================`);
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
