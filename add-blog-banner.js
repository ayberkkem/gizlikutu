/**
 * Blog Banner Injector
 * Tüm sayfalara blog banner ekler
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

// Blog banner HTML
const BLOG_BANNER_HTML = `
    <!-- BLOG BANNER - SEO İçerik Promosyonu -->
    <section class="blog-banner-section" aria-label="Blog İçerikleri">
      <div class="blog-banner-container">
        <!-- Sol: Duygusal Metin -->
        <div class="blog-banner-left">
          <span class="blog-banner-tagline">Sadece Seninle</span>
          <h3 class="blog-banner-title">Zevki Keşfetmenin Zamanı Geldi</h3>
          <p class="blog-banner-subtitle">
            <strong>Daha derin bağlar</strong>, daha yoğun anlar... 
            Uzman rehberlerimizle hayatına renk kat.
          </p>
        </div>

        <!-- Orta: Neon Görsel -->
        <a href="./blog.html" class="blog-banner-image-wrapper" title="Gizli Kutu Blog">
          <img src="./assets/blog-banner-neon.jpg" alt="Gizli Kutu Sex Shop Blog - Cinsel Sağlık Rehberleri" loading="lazy">
        </a>

        <!-- Sağ: Butonlar -->
        <div class="blog-banner-right">
          <a href="./blog.html" class="blog-banner-btn blog-banner-btn-blog">
            <svg viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            İpuçlarını Keşfet
          </a>
          <a href="https://wa.me/905400443445?text=Merhaba,%20blog%20içeriklerinizi%20okudum,%20danışmanlık%20almak%20istiyorum" target="_blank" class="blog-banner-btn blog-banner-btn-whatsapp">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 11.6c0 4.6-3.8 8.4-8.4 8.4-1.5 0-2.9-.4-4.2-1.1L4 20l1.2-3.3c-.8-1.3-1.2-2.8-1.2-4.4C4 7 7.8 3.2 12.4 3.2 16.9 3.2 20.7 7 20.7 11.6Z" fill="#fff"/><path d="M9.2 8.8c.2-.4.4-.4.6-.4h.5c.2 0 .4.1.5.3l.7 1.7c.1.2.1.4 0 .5l-.3.5c-.1.2-.1.4 0 .6.4.7 1.2 1.5 2 2 .2.1.4.1.6 0l.5-.3c.2-.1.4-.1.5 0l1.7.7c.2.1.3.3.3.5v.5c0 .2 0 .4-.4.6-.4.2-1.2.4-2.1.1-1-.3-2.2-1-3.2-2s-1.7-2.2-2-3.2c-.3-.9-.1-1.7.1-2.1Z" fill="#25D366"/></svg>
            Özel Danışmanlık
          </a>
        </div>
      </div>
    </section>

`;

// CSS link
const CSS_LINK = '  <link rel="stylesheet" href="./css/blog-banner.css">';

// Sadece belirli sayfalara ekle (city, products, popular, cart, checkout, about, contact)
const TARGET_FILES = [
    'products.html',
    'popular.html',
    'cart.html',
    'checkout.html',
    'about.html',
    'contact.html'
];

// Şehir sayfalarını da dahil et
function shouldProcess(filename) {
    if (filename.includes('-sex-shop.html')) return true;
    if (TARGET_FILES.includes(filename)) return true;
    return false;
}

function hasCSS(content) {
    return content.includes('blog-banner.css');
}

function hasBanner(content) {
    return content.includes('blog-banner-section');
}

function addCSS(content) {
    // </head> öncesine veya son CSS'den sonra ekle
    if (content.includes('category-nav.css')) {
        return content.replace(
            /<link rel="stylesheet" href="\.\/css\/category-nav\.css">/,
            '<link rel="stylesheet" href="./css/category-nav.css">\n' + CSS_LINK
        );
    }
    // Alternatif: </head> öncesine ekle
    return content.replace('</head>', CSS_LINK + '\n</head>');
}

function addBanner(content) {
    // WhatsApp QR alanı veya footer öncesine ekle
    // qr-zone veya footer öncesi
    if (content.includes('class="qr-zone"')) {
        return content.replace(
            /<section class="qr-zone">/,
            BLOG_BANNER_HTML + '    <section class="qr-zone">'
        );
    }
    // Footer öncesine ekle
    if (content.includes('<footer class="footer">')) {
        return content.replace(
            '<footer class="footer">',
            BLOG_BANNER_HTML + '\n  <footer class="footer">'
        );
    }
    // </main> öncesine ekle
    if (content.includes('</main>')) {
        return content.replace(
            '</main>',
            BLOG_BANNER_HTML + '  </main>'
        );
    }
    return content;
}

async function processFiles() {
    let cssCount = 0;
    let bannerCount = 0;
    let skippedCount = 0;

    const files = fs.readdirSync(PUBLIC_DIR);

    for (const file of files) {
        if (!file.endsWith('.html')) continue;
        if (!shouldProcess(file)) continue;

        // index.html zaten güncellendi, atla
        if (file === 'index.html') continue;

        const filePath = path.join(PUBLIC_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // CSS ekle
        if (!hasCSS(content)) {
            content = addCSS(content);
            cssCount++;
            modified = true;
        }

        // Banner ekle
        if (!hasBanner(content)) {
            content = addBanner(content);
            bannerCount++;
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file}`);
        } else {
            skippedCount++;
        }
    }

    console.log('\n========================================');
    console.log(`📊 İşlem Tamamlandı!`);
    console.log(`   CSS Eklenen: ${cssCount}`);
    console.log(`   Banner Eklenen: ${bannerCount}`);
    console.log(`   Atlanan: ${skippedCount}`);
    console.log('========================================\n');
}

processFiles();
