/**
 * Investigador - Test extraer imagen de web oficial y Tripadvisor via Puppeteer headless con stealth
 */
const puppeteer = require('puppeteer');

async function testCuervo() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  // Test Tripadvisor review direct page with realistic delay & stealth
  console.log('Testing TA page...');
  const taUrl = 'https://www.tripadvisor.com.ar/Restaurant_Review-g312741-d12607745-Reviews-Cuervo_Cafe-Buenos_Aires_Capital_Federal_District.html';
  try {
    await page.goto(taUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    const title = await page.title();
    console.log('Page Title:', title);
    
    // Check if Cloudflare blocked
    const content = await page.content();
    console.log('Contains Cloudflare/Attention?:', content.includes('Just a moment') || content.includes('Cloudflare') || content.includes('Attention Required'));
    
    // Try extract og:image or any image
    const ogImg = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
    console.log('og:image:', ogImg);
    
    // Try extract description
    const desc = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
    console.log('meta description:', desc);
    
  } catch (e) {
    console.log('TA Error:', e.message);
  } finally {
    await browser.close();
  }
}

testCuervo();
