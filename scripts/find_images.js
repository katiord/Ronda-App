const fs = require('fs');
const path = require('path');

const places = require('../backend/data/places_caba.json');

async function searchCommons(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', query + ' -logo -icon -coat -escudo');
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '8');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|size|mime|extmetadata');
  url.searchParams.set('format', 'json');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'RondaAppResearch/1.0 (contact@ronda.app)' }
    });
    const data = await res.json();
    const pages = data.query?.pages || {};
    const results = [];
    for (const [id, page] of Object.entries(pages)) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const title = page.title || '';
      const w = info.width || 0;
      const h = info.height || 0;
      const mime = info.mime || '';
      const meta = info.extmetadata || {};
      const desc = meta.ImageDescription?.value || meta.ObjectName?.value || '';

      // Skip non-photo or tiny
      if (!mime.startsWith('image/')) continue;
      if (w < 500 || h < 350) continue;
      if (/logo|escudo|coat_of_arms|plan|mapa|diagram|icon/i.test(title)) continue;

      results.push({
        title,
        url: info.url,
        width: w,
        height: h,
        desc: desc.replace(/<[^>]+>/g, '').slice(0, 150)
      });
    }
    return results;
  } catch (err) {
    return [];
  }
}

async function run() {
  const resultsMap = {};
  console.log(`Buscando imágenes para ${places.length} lugares...`);

  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    console.log(`[${i + 1}/${places.length}] ${p.name} (${p.neighborhood})...`);

    // Probar varias variantes de búsqueda
    const queries = [
      p.name,
      `${p.name} Buenos Aires`,
      `${p.name} ${p.neighborhood}`
    ];

    let found = [];
    for (const q of queries) {
      found = await searchCommons(q);
      if (found.length > 0) break;
      // Pequeño delay cortés
      await new Promise(r => setTimeout(r, 150));
    }

    resultsMap[p.id] = {
      name: p.name,
      neighborhood: p.neighborhood,
      category: p.category,
      candidates: found.slice(0, 3)
    };
  }

  fs.writeFileSync(
    path.resolve(__dirname, 'image_candidates_commons.json'),
    JSON.stringify(resultsMap, null, 2),
    'utf8'
  );

  let withMatch = 0;
  for (const [id, val] of Object.entries(resultsMap)) {
    if (val.candidates.length > 0) withMatch++;
  }
  console.log(`\nCompletado: ${withMatch}/${places.length} con coincidencia en Wikimedia Commons.`);
}

run();
