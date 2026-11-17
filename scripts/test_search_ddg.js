/**
 * Investigador - Test DuckDuckGo y Google / GCBA scraping
 */
async function test() {
  const query = 'Cuervo Café Palermo Buenos Aires';
  console.log('Testing DuckDuckGo HTML for query:', query);
  try {
    const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Length:', text.length);
    const matches = text.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);
    if (matches) {
      console.log('Found snippets:', matches.length);
      console.log('Sample:', matches[0].replace(/<[^>]+>/g, '').trim());
    } else {
      console.log('No snippet matches found');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
