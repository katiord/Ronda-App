/**
 * Test DDG search for authentic info & reviews for a place
 */
async function testSearch(query) {
  console.log('Query:', query);
  const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const regex = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  const snippets = [];
  while ((match = regex.exec(html)) !== null) {
    snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
  }
  console.log('Snippets found:', snippets.length);
  snippets.slice(0, 4).forEach((s, i) => console.log(`  [${i+1}] ${s}`));
}

testSearch('Café Rivas Estados Unidos San Telmo Buenos Aires');
