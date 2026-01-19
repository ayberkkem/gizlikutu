const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

// 1. HTML dosyalarını bul ve cities.html'i oluştur
const cityFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('-sex-shop.html'));
cityFiles.sort(); // Alfabetik sıra

// Linkleri oluştur
const linksHTML = cityFiles.map(file => {
    let name = file.replace(/-/g, ' ').replace('.html', '');
    name = name.replace(/\b\w/g, l => l.toUpperCase()); // Baş harfleri büyüt
    return `<a href="./${file}" class="city-link">${name}</a>`;
}).join('');

const htmlContent = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="./assets/logo.jpg" type="image/jpeg">
  <title>Hizmet Bölgelerimiz | Gizli Kutu</title>
  <meta name="description" content="Türkiye'nin 81 iline ve tüm ilçelerine gizli kargo ile yetişkin ürünleri teslimatı. Hizmet bölgelerimiz ve teslimat süreleri.">
  <link rel="stylesheet" href="./css/main.css">
  <link rel="stylesheet" href="./css/pages/index.css">
  <style>
    .cities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
        margin: 30px 0;
    }
    .city-link {
        display: block;
        padding: 10px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        text-decoration: none;
        color: #333;
        font-size: 13px;
        text-align: center;
        transition: all 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .city-link:hover {
        background: #9333ea;
        color: white;
        border-color: #9333ea;
        transform: translateY(-2px);
    }
  </style>
</head>
<body>
  
  <header id="mainHeader" style="border-bottom:1px solid #eee; background:#fff; position:sticky; top:0; z-index:100;">
    <div class="container">
      <div class="header-row" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;">
        <a class="logo" href="./index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;">
          <img src="./assets/logo.jpg" alt="Logo" style="width:32px;height:32px;border-radius:6px;">
          <span style="font-weight:800;font-size:18px;color:#111;">Gizli Kutu</span>
        </a>
        <a href="./index.html" class="btn primary" style="padding:6px 12px;font-size:12px;">Ana Sayfaya Dön</a>
      </div>
    </div>
  </header>

  <main class="container" style="padding-top:20px; padding-bottom:40px;">
    <h1 style="text-align:center; margin-bottom:10px;">Hizmet Bölgelerimiz</h1>
    <p style="text-align:center; color:#666; max-width:600px; margin:0 auto 30px;">Türkiye'nin her noktasına %100 gizli paketleme ve güvenli teslimat ile hizmet veriyoruz. Aşağıdaki listeden bölgenize özel teslimat seçeneklerini inceleyebilirsiniz.</p>
    
    <div class="cities-grid">
        ${linksHTML}
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      © <span id="y">${new Date().getFullYear()}</span> Gizli Kutu •
      <a href="./cities.html">Hizmet Bölgelerimiz</a> • 
      <a href="./privacy.html">Gizlilik</a> • 
      <a href="./contact.html">İletişim</a>
    </div>
  </footer>

  <!-- WhatsApp Float (Centered) -->
  <a href="https://wa.me/905400443445" target="_blank" aria-label="WhatsApp" 
     style="position:fixed; top:50%; right:10px; transform:translateY(-50%); width:60px; height:60px; background:#25D366; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.3); z-index:9999; text-decoration:none;">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
      </svg>
  </a>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'cities.html'), htmlContent, 'utf8');
console.log('Created public/cities.html with ' + cityFiles.length + ' links.');

// 2. Footer'a Link Ekleme
function getAllHTMLFiles(dirPath, arrayOfFiles) {
    const all = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    all.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllHTMLFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.html')) arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const allHTML = getAllHTMLFiles(publicDir);
let updatedCount = 0;

allHTML.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Link zaten var mı bak
    if (!content.includes('href="./cities.html"')) {
        // Footer linklerini bul: <a href="./contact.html">İletişim</a>
        // Arkasına ekle
        // Regex ile daha güvenli bulalım
        const contactLinkRegex = /<a\s+href=".\/contact.html">İletişim<\/a>/;

        if (content.match(contactLinkRegex)) {
            content = content.replace(contactLinkRegex, '<a href="./contact.html">İletişim</a> • <a href="./cities.html">Hizmet Bölgelerimiz</a>');
            fs.writeFileSync(file, content, 'utf8');
            updatedCount++;
        }
    }
});

console.log(`Updated footer in ${updatedCount} files.`);
