/**
 * Ronda — Investigador: TripAdvisor Argentina Scraper v2
 * Extrae imagen, "Acerca de" y "Características" de cada lugar del catálogo.
 * Usa Puppeteer (headless browser) para superar la protección Cloudflare.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const catalog = require('../backend/data/places_caba.json');
const OUTPUT_FILE = path.resolve(__dirname, 'tripadvisor_data.json');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function searchAndExtract(browser, place) {
  const result = {
    id: place.id,
    name: place.name,
    neighborhood: place.neighborhood,
    address: place.address,
    ta_url: null,
    image_url: null,
    about: null,
    features: [],
    found: false
  };

  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    // Step 1: Search on TripAdvisor
    const searchQuery = `${place.name} ${place.neighborhood} Buenos Aires`;
    const searchUrl = `https://www.tripadvisor.com.ar/Search?q=${encodeURIComponent(searchQuery)}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Wait for search results
    try {
      await page.waitForSelector('a[href*="Restaurant_Review"], a[href*="Attraction_Review"]', { timeout: 8000 });
    } catch (e) {
      // might not find any
    }

    // Find the first relevant link
    const taLink = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="Restaurant_Review"], a[href*="Attraction_Review"]');
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
          return href.startsWith('http') ? href : 'https://www.tripadvisor.com.ar' + href;
        }
      }
      return null;
    });

    if (!taLink) {
      console.log(`  [MISS] No TA link found`);
      return result;
    }

    result.ta_url = taLink;
    console.log(`  [HIT] ${taLink.substring(0, 90)}`);

    // Step 2: Navigate to the place page
    await page.goto(taLink, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    // Step 3: Extract image (og:image is most reliable)
    const imageUrl = await page.evaluate(() => {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) return ogImg.getAttribute('content');
      const heroImg = document.querySelector('.hero-photo img, [data-testid="photo-viewer"] img');
      if (heroImg) return heroImg.getAttribute('src') || heroImg.getAttribute('data-src');
      return null;
    });

    if (imageUrl) {
      result.image_url = imageUrl.replace(/photo-[a-z]\//, 'photo-o/').replace(/w=\d+/, 'w=1200');
      console.log(`  [IMG] OK`);
    }

    // Step 4: Extract "Acerca de"
    const about = await page.evaluate(() => {
      const selectors = [
        '[data-testid="about-section"]', '.about-section', '#ABOUT_TAB',
        '.jsTruncate', '[data-automation="about"]'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 20) {
          return el.textContent.trim().substring(0, 500);
        }
      }
      const headings = document.querySelectorAll('h2, h3');
      for (const h of headings) {
        const text = h.textContent.trim().toLowerCase();
        if (text.includes('acerca de') || text.includes('about')) {
          const parent = h.parentElement;
          if (parent) {
            const pTags = parent.querySelectorAll('p, span, div');
            for (const p of pTags) {
              const pt = p.textContent.trim();
              if (pt.length > 30 && !pt.toLowerCase().includes('acerca de')) return pt.substring(0, 500);
            }
          }
        }
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) return metaDesc.getAttribute('content');
      return null;
    });

    if (about) {
      result.about = about.replace(/\s+/g, ' ').trim();
      console.log(`  [ABOUT] ${result.about.substring(0, 60)}...`);
    }

    // Step 5: Extract "Características"
    const features = await page.evaluate(() => {
      const feats = [];
      const selectors = [
        '[data-testid="restaurant-detail-features"] li',
        '[data-testid="details-card"] li',
        '.detail-section li', '.detailCard li',
        '[class*="feature"] li', '[class*="amenity"] li'
      ];
      for (const sel of selectors) {
        const items = document.querySelectorAll(sel);
        if (items.length > 0) {
          items.forEach(item => {
            const text = item.textContent.trim();
            if (text.length > 2 && text.length < 100) feats.push(text);
          });
          if (feats.length > 0) break;
        }
      }
      if (feats.length === 0) {
        const headings = document.querySelectorAll('h2, h3');
        for (const h of headings) {
          const text = h.textContent.trim().toLowerCase();
          if (text.includes('caracter') || text.includes('detalle') || text.includes('feature')) {
            const section = h.closest('section, div[class]');
            if (section) {
              section.querySelectorAll('li, span[class]').forEach(item => {
                const t = item.textContent.trim();
                if (t.length > 2 && t.length < 100) feats.push(t);
              });
            }
          }
        }
      }
      return [...new Set(feats)].slice(0, 15);
    });

    if (features.length > 0) {
      result.features = features;
      console.log(`  [FEAT] ${features.length} items`);
    }

    result.found = !!(result.image_url || result.about || result.features.length > 0);

  } catch (err) {
    console.error(`  [ERROR] ${err.message.substring(0, 80)}`);
  } finally {
    try { if (page) await page.close(); } catch (e) { /* page already closed */ }
  }

  return result;
}

async function run() {
  console.log(`\n🔍 RONDA — TripAdvisor Scraper v2`);
  console.log(`   ${catalog.length} lugares\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const results = [];
  let found = 0;

  for (let i = 0; i < catalog.length; i++) {
    const place = catalog[i];
    console.log(`[${i + 1}/${catalog.length}] ${place.name} (${place.neighborhood})`);

    const data = await searchAndExtract(browser, place);
    results.push(data);
    if (data.found) found++;

    // Save progress incrementally
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

    // Polite delay (3-5s)
    const delay = 3000 + Math.random() * 2000;
    await sleep(delay);
  }

  await browser.close();

  console.log(`\n✅ Completado: ${found}/${catalog.length} con datos.`);
  console.log(`   Guardado en: ${OUTPUT_FILE}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
