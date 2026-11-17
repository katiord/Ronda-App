async function testTA() {
  const query = "Cafe Rivas Estados Unidos 302 Buenos Aires";
  const searchUrl = `https://www.tripadvisor.com.ar/Search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('Length:', html.length);
    console.log('Title/Preview:', html.slice(0, 500));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testTA();
