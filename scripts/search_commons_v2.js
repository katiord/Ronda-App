async function search(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RondaAudit2/1.0' } });
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    console.log(`\n=== Query: "${q}" ===`);
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (info && info.width >= 800) {
        console.log(`- ${p.title} (${info.width}x${info.height}): ${info.url}`);
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

async function run() {
  await search('Museo Nacional de Bellas Artes fachada Buenos Aires');
  await search('Mercado de San Telmo interior');
  await search('Jardín Japonés Buenos Aires puente');
  await search('Jardín Botánico Carlos Thays invernáculo');
  await search('Pizzería Burgio');
  await search('Parrilla La Brigada');
  await search('Mural Chacarita Newbery');
}

run();
