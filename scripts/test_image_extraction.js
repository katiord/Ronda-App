/**
 * Test extracting image from Instagram / official web / OpenGraph of Cafe Rivas
 */
async function testImageExtraction() {
  const urls = [
    'https://caferivas.com/',
    'https://turismo.buenosaires.gob.ar/es/gastronomia/caf%C3%A9-rivas'
  ];

  for (const url of urls) {
    try {
      console.log('Fetching URL:', url);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      console.log('Status:', res.status);
      const html = await res.text();
      const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
        || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
      console.log('OG Image found:', ogMatch ? ogMatch[1] : 'None');
      
      // Also look for img src with facade or salon
      const imgMatches = html.match(/<img[^>]+src="([^">]+\.(?:jpg|jpeg|png|webp))"[^>]*>/gi) || [];
      console.log('Total img tags:', imgMatches.length);
      imgMatches.slice(0, 3).forEach((img, i) => console.log(`  Img ${i+1}:`, img));
    } catch (e) {
      console.log('Error fetching:', url, e.message);
    }
  }
}

testImageExtraction();
