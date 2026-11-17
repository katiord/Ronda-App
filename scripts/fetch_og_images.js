async function getOgImage(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const match = text.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const urls = {
    corte_comedor: 'https://guide.michelin.com/en/capital-federal/buenos-aires/restaurant/corte-comedor',
    anafe: 'https://guide.michelin.com/en/capital-federal/buenos-aires/restaurant/anafe',
    la_brigada: 'https://guide.michelin.com/en/capital-federal/buenos-aires/restaurant/la-brigada',
    donnet: 'https://guide.michelin.com/en/capital-federal/buenos-aires/restaurant/donnet'
  };

  for (const [key, url] of Object.entries(urls)) {
    const img = await getOgImage(url);
    console.log(key, '=>', img);
  }
}

run();
