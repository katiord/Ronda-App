// Test TripAdvisor autocomplete/typeahead API and page fetching approaches
const places = require('../backend/data/places_caba.json');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
  'Referer': 'https://www.google.com/'
};

async function tryTypeahead(query) {
  const url = `https://www.tripadvisor.com.ar/TypeAheadJson?action=API&types=geo,hotel,eat,attr&query=${encodeURIComponent(query)}&max=3`;
  try {
    const r = await fetch(url, { headers: HEADERS });
    console.log(`TypeAhead [${query}]: status=${r.status}`);
    if (r.ok) {
      const data = await r.json();
      console.log('  Result:', JSON.stringify(data).slice(0, 300));
      return data;
    }
    return null;
  } catch (e) {
    console.error(`TypeAhead error: ${e.message}`);
    return null;
  }
}

async function trySearchPage(query) {
  const url = `https://www.tripadvisor.com.ar/Search?q=${encodeURIComponent(query)}&searchSessionId=test&sid=test`;
  try {
    const r = await fetch(url, { headers: HEADERS, redirect: 'follow' });
    console.log(`Search [${query}]: status=${r.status}`);
    const html = await r.text();
    console.log(`  HTML length: ${html.length}`);
    // Check if we got real content or cloudflare
    if (html.includes('data-cfasync') || html.includes('Please enable JS')) {
      console.log('  -> Cloudflare blocked');
      return null;
    }
    // Try to find og:image
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch) console.log('  og:image:', ogMatch[1]);
    return html;
  } catch (e) {
    console.error(`Search error: ${e.message}`);
    return null;
  }
}

async function tryGraphQL(query) {
  // TripAdvisor uses a GraphQL-like search endpoint
  const url = 'https://www.tripadvisor.com.ar/data/graphql/ids';
  const body = JSON.stringify([{
    query: "TypeaheadQuery",
    variables: {
      request: {
        query: query,
        limit: 3,
        scope: "WORLDWIDE",
        locale: "es_AR",
        types: ["LOCATION"],
        searchCenter: { latitude: -34.6037, longitude: -58.3816 }
      }
    }
  }]);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body
    });
    console.log(`GraphQL [${query}]: status=${r.status}`);
    if (r.ok) {
      const text = await r.text();
      console.log('  Response:', text.slice(0, 300));
    }
  } catch (e) {
    console.error(`GraphQL error: ${e.message}`);
  }
}

async function tryGoogleForTA(placeName) {
  // Use Google to find TripAdvisor URLs
  const query = `site:tripadvisor.com.ar "${placeName}" Buenos Aires`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=es`;
  try {
    const r = await fetch(url, { headers: HEADERS });
    console.log(`Google [${placeName}]: status=${r.status}`);
    const html = await r.text();
    // Extract TripAdvisor URLs from results
    const taUrls = html.match(/https:\/\/www\.tripadvisor\.com\.ar\/[^"&\s]+/g);
    if (taUrls) {
      console.log('  TA URLs found:', taUrls.slice(0, 3));
      return taUrls[0];
    } else {
      console.log('  No TA URLs found');
    }
  } catch (e) {
    console.error(`Google error: ${e.message}`);
  }
  return null;
}

async function run() {
  const testPlace = places[0]; // LAB Tostadores de Café
  const testPlace2 = places[10]; // Mercado de San Telmo
  
  console.log('=== Testing approach 1: TypeAhead API ===');
  await tryTypeahead('Cafe Rivas Buenos Aires');
  
  console.log('\n=== Testing approach 2: Search Page ===');
  await trySearchPage('Mercado de San Telmo Buenos Aires');
  
  console.log('\n=== Testing approach 3: GraphQL ===');
  await tryGraphQL('LAB Tostadores Buenos Aires');
  
  console.log('\n=== Testing approach 4: Google → TA URL ===');
  await tryGoogleForTA('Mercado de San Telmo');
}

run();
