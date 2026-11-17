import requests
import json
from pathlib import Path

catalog_path = Path(__file__).resolve().parent.parent / "backend" / "data" / "places_caba.json"
with open(catalog_path, "r", encoding="utf-8") as f:
    places = json.load(f)

def search_commons(query):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query + " filetype:bitmap -logo -coat -escudo",
        "gsrnamespace": 6,
        "gsrlimit": 4,
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "format": "json"
    }
    try:
        r = requests.get(url, params=params, headers={"User-Agent": "RondaApp/1.0 (info@ronda.app)"}, timeout=10)
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        results = []
        for pid, p in pages.items():
            title = p.get("title", "")
            infos = p.get("imageinfo", [])
            if infos:
                url_img = infos[0]["url"]
                width = infos[0].get("width", 0)
                height = infos[0].get("height", 0)
                # Prefer landscape / good resolution images
                if width >= 600 and height >= 400 and not any(bad in title.lower() for bad in ["logo", "icon", "escudo", "map"]):
                    results.append({
                        "title": title,
                        "url": url_img,
                        "width": width,
                        "height": height
                    })
        return results
    except Exception as e:
        return []

print(f"Total lugares en catálogo: {len(places)}")
found_count = 0
for idx, p in enumerate(places[:15]):
    # Intentar búsqueda con nombre exacto o combinaciones
    queries = [
        f'"{p["name"]}"',
        f'{p["name"]} Buenos Aires',
        f'{p["name"]} {p["neighborhood"]}'
    ]
    imgs = []
    for q in queries:
        imgs = search_commons(q)
        if imgs:
            break
    print(f"[{idx+1}/{len(places)}] {p['name']} ({p['neighborhood']}):")
    if imgs:
        found_count += 1
        print(f"   ✓ {imgs[0]['title']} ({imgs[0]['width']}x{imgs[0]['height']})")
        print(f"     URL: {imgs[0]['url']}")
    else:
        print("   ✗ No direct match en Commons")

print(f"\nEncontrados: {found_count}/15 probados.")
