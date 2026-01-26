const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const products = JSON.parse(fs.readFileSync(path.join(publicDir, 'data', 'products.json'), 'utf8'));
// ONLY provinces and protected districts remain in public/ as -sex-shop.html
const cityFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('-sex-shop.html'));

const BASE_URL = 'https://gizlikutu.online';
const TODAY = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Ana Sayfalar -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/cities</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Ürün Detay Sayfaları -->
`;

products.forEach(p => {
    if (p.id) {
        sitemap += `  <url>
    <loc>${BASE_URL}/product?id=${encodeURIComponent(p.id)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
});

sitemap += `\n  <!-- Hizmet Bölgeleri (İller + Akhisar) -->\n`;

cityFiles.forEach(c => {
    const slug = c.replace('.html', '');
    sitemap += `  <url>
    <loc>${BASE_URL}/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
});

sitemap += `</urlset>`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log(`Generated sitemap with ${products.length} products and ${cityFiles.length} city pages.`);
