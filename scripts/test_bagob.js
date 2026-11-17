async function test() {
  const res = await fetch('https://turismo.buenosaires.gob.ar/es/gastronomia/cafe-rivas');
  console.log('Status:', res.status);
  if (res.ok) {
    const html = await res.text();
    const m = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    console.log('OG Image:', m ? m[1] : 'None');
  }
}
test();
