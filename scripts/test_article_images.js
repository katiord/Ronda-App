/**
 * Test finding real image links via DDG images or articles
 */
async function testArticleScraping() {
  const query = 'Café Rivas Buenos Aires Bar Notable salon fachada';
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  
  // Find article links
  const links = [];
  const regex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let cleanUrl = m[1];
    if (cleanUrl.includes('uddg=')) {
      cleanUrl = decodeURIComponent(cleanUrl.split('uddg=')[1].split('&')[0]);
    }
    links.push(cleanUrl);
  }
  console.log('Article links:', links.slice(0, 5));

  for (const articleUrl of links.slice(0, 3)) {
    try {
      console.log('Inspecting article:', articleUrl);
      const aRes = await fetch(articleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      const aHtml = await aRes.text();
      const ogMatch = aHtml.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
        || aHtml.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
      console.log('  -> OG Image:', ogMatch ? ogMatch[1] : 'None');
    } catch (e) {
      console.log('  -> Failed:', e.message);
    }
  }
}

testArticleScraping();
