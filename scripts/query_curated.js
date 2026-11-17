const fs = require('fs');

const queriesMap = {
  palermo_jardin_botanico: 'Jardín Botánico Carlos Thays',
  palermo_rosedal: 'El Rosedal Palermo',
  palermo_plaza_cortazar: 'Plazoleta Julio Cortazar',
  palermo_jardin_japones: 'Jardín Japonés Buenos Aires',
  santelmo_mercado: 'Mercado de San Telmo',
  santelmo_bar_britanico: '"Bar Británico" Buenos Aires',
  santelmo_bar_el_federal: '"Bar El Federal" San Telmo',
  santelmo_mamba: 'FachadaModerno.jpg OR "Museo de Arte Moderno" Buenos Aires',
  santelmo_parque_lezama: '"Parque Lezama"',
  santelmo_pasaje_defensa: '"Casa de los Ezeiza" OR "Pasaje de la Defensa"',
  santelmo_cafe_rivas: '"Cafe Rivas"',
  santelmo_pasaje_san_lorenzo_casa_minima: '"Casa Mínima" San Telmo',
  recoleta_ateneo_splendid: '"El Ateneo Grand Splendid" OR "El Ateneo" Buenos Aires',
  recoleta_bellas_artes: '"Museo Nacional de Bellas Artes" Buenos Aires',
  recoleta_la_biela: '"La Biela" Recoleta',
  recoleta_ccr: '"Centro Cultural Recoleta"',
  recoleta_plaza_francia: '"Cementerio de la Recoleta"',
  recoleta_duhau_patio: '"Palacio Duhau"',
  recoleta_floralis_generica_parque_thays: '"Floralis Genérica"',
  chacarita_parque_los_andes: '"Parque Los Andes"',
  colegiales_mercado_pulgas: '"Mercado de las Pulgas" Colegiales',
  belgrano_via_viva_barrio_chino: '"Barrio Chino de Buenos Aires"',
  belgrano_museo_larreta: '"Museo de Arte Español Enrique Larreta"',
  belgrano_barrancas_glorieta: '"Barrancas de Belgrano" Glorieta',
  belgrano_el_torreon: '"Estación Belgrano R"',
  belgrano_plaza_castelli_estacion: '"Plaza Castelli" Belgrano',
  colegiales_plaza_mafalda_pasajes: '"Plaza Mafalda"',
  recoleta_milion_bar: '"Milión" Buenos Aires',
  santelmo_pulperia_quilapan: '"Pulpería Quilapán"',
  santelmo_la_brigada: '"La Brigada" San Telmo',
  belgrano_pizzeria_burgio: '"Burgio" Cabildo',
  palermo_bar_878: '"Bar 878"',
  palermo_tres_monos: '"Tres Monos"',
  chacarita_sifon_soderia: '"Sifón Sodería"',
  chacarita_la_fuerza: '"La Fuerza" Chacarita',
  colegiales_strange_brewing: '"Strange Brewing"',
  palermo_libros_pasaje: '"Libros del Pasaje"'
};

async function checkOne(id, q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RondaAppAuditor/1.0 (info@ronda.app)' } });
    const text = await res.text();
    if (!text.startsWith('{')) {
      console.log(`[${id}] Throttled: ${text.slice(0, 50)}`);
      return null;
    }
    const data = JSON.parse(text);
    const pages = Object.values(data.query?.pages || {});
    const imgs = [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (info && info.mime?.startsWith('image/') && info.width >= 600) {
        imgs.push({ title: p.title, url: info.url, w: info.width, h: info.height });
      }
    }
    return imgs;
  } catch (err) {
    console.error(`[${id}] Error:`, err.message);
    return null;
  }
}

async function run() {
  const results = {};
  for (const [id, q] of Object.entries(queriesMap)) {
    console.log(`Querying ${id}: ${q}...`);
    const imgs = await checkOne(id, q);
    if (imgs && imgs.length > 0) {
      console.log(`  -> Found ${imgs.length}: ${imgs[0].title}`);
      results[id] = imgs[0];
    } else {
      console.log(`  -> No match`);
    }
    await new Promise(r => setTimeout(r, 1200)); // 1.2s delay to never throttle
  }
  fs.writeFileSync('scripts/commons_curated.json', JSON.stringify(results, null, 2));
  console.log('Finished. Saved to scripts/commons_curated.json');
}

run();
