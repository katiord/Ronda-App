async function testQuery(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RondaTest/1.0' } });
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    console.log(`\n=== Query: "${q}" ===`);
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (info && info.mime.startsWith('image/')) {
        console.log(`- ${p.title} (${info.width}x${info.height}): ${info.url}`);
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

async function run() {
  await testQuery('"Bar Britanico" Buenos Aires');
  await testQuery('"Cafe Rivas"');
  await testQuery('"Floralis Generica"');
  await testQuery('"Cementerio de la Recoleta"');
  await testQuery('"Barrancas de Belgrano"');
  await testQuery('"Barrio Chino" Buenos Aires');
  await testQuery('"Plaza Serrano" Buenos Aires');
  await testQuery('"Plaza Cortazar"');
  await testQuery('"Milion" Parana Buenos Aires');
  await testQuery('"Bar 878"');
  await testQuery('"Tres Monos" Bar');
  await testQuery('"Sifon" Newbery');
  await testQuery('"La Fuerza" Dorrego');
  await testQuery('"Burgio" Cabildo');
  await testQuery('"Casa de los Ezeiza"');
}

run();
