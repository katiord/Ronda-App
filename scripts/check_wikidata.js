const fs = require('fs');

async function searchWikidata(term) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=es&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RondaApp/1.0' } });
    const data = await res.json();
    return data.search || [];
  } catch (e) {
    return [];
  }
}

async function getWikidataClaims(entityId) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entityId}&property=P18&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'RondaApp/1.0' } });
    const data = await res.json();
    const claims = data.claims?.P18 || [];
    if (claims.length > 0) {
      const fileName = claims[0].mainsnak?.datavalue?.value;
      if (fileName) {
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const placesToTry = [
    'Burgio Cabildo',
    'Bar La Fuerza',
    'Milión Buenos Aires',
    'Presidente Bar Recoleta',
    'La Brigada San Telmo',
    'Bar 878',
    'Niño Gordo',
    'Sifón Sodería',
    'Floralis Genérica'
  ];

  for (const p of placesToTry) {
    const results = await searchWikidata(p);
    console.log(`Wikidata for "${p}": found ${results.length}`);
    if (results.length > 0) {
      const top = results[0];
      console.log(`  Top: ${top.id} - ${top.label}: ${top.description}`);
      const img = await getWikidataClaims(top.id);
      if (img) console.log(`  Image: ${img}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }
}

run();
