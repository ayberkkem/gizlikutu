const fs = require('fs');
const path = require('path');

const cities = [
    { "name": "Manisa", "districts": ["Akhisar"] }
];

const templatePath = path.join(__dirname, 'public/akhisar-sex-shop.html');
const outputDir = path.join(__dirname, 'public');

if (!fs.existsSync(templatePath)) {
    console.error("Template file not found at " + templatePath);
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/i̇/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function processTemplate(cityName, isProvince = true, provinceName = "") {
    let content = template;
    const citySlug = slugify(cityName);
    const simpleName = cityName;

    // 1. Precise Replacements
    // Title & Meta
    content = content.replace(/Akhisar Sex Shop/g, `${simpleName} Sex Shop`);
    content = content.replace(/Seks Shop Akhisar/g, `Seks Shop ${simpleName}`);
    content = content.replace(/Akhisar sex shop/g, `${simpleName} sex shop`); // Keep original casing or capitalize? Template uses lowercase in some content.

    // General Content Replacements (Global and Case Insensitive for safety)
    content = content.replace(/Akhisar/g, simpleName);
    content = content.replace(/AKHİSAR/g, simpleName.toUpperCase());
    content = content.replace(/akhisar/g, simpleName.toLowerCase());

    // Specific Grammar Fixes (Simple approximation)
    content = content.replace(new RegExp(`${simpleName}'ın`, 'g'), `${simpleName}'nın`);
    content = content.replace(new RegExp(`${simpleName}'in`, 'g'), `${simpleName}'nin`);

    // Schema & Metadata
    content = content.replace(/"addressLocality":"(.*?)"/, `"addressLocality":"${simpleName}"`);
    content = content.replace(/"addressRegion":"(.*?)"/, `"addressRegion":"${provinceName || simpleName}"`);

    // Hero Title
    content = content.replace(/"hero-brand-title">.*?<\/div>/, `"hero-brand-title">${simpleName.toUpperCase()}<\/div>`);


    // FORCE SPECIFIC TITLE FORMAT (User Request)
    // Replaces the entire <title> tag found in the template with the requested format
    content = content.replace(/<title>.*?<\/title>/i, `<title>${simpleName} Sex Shop | Gizli Paketleme ile Güvenli Alışveriş</title>`);

    // Also update OpenGraph title to match
    content = content.replace(/<meta property="og:title" content=".*?">/i, `<meta property="og:title" content="${simpleName} Sex Shop | Gizli Paketleme ile Güvenli Alışveriş">`);

    // DYNAMIC MAP REPLACEMENT
    // Replaces the map iframe with a Query-based embed. 
    // This ensures "View Larger Map" opens the correct search query and the map is centered on the city name.
    if (citySlug !== 'akhisar') {
        const query = encodeURIComponent(`${simpleName}, Türkiye`);
        // Using the older but robust maps.google.com embed which doesn't require specific lat/long hashes
        // This guarantees that the "View Larger Map" link will simply search for the query provided.
        const newMapSrc = `https://maps.google.com/maps?q=${query}&hl=tr&z=12&ie=UTF8&output=embed`;

        // Replace the existing iframe src (which uses the complex pb= embed format)
        content = content.replace(/src="https:\/\/www\.google\.com\/maps\/embed\?pb=[^"]+"/, `src="${newMapSrc}"`);
    }



    // 2. Delivery Logic for Non-Akhisar
    if (citySlug !== 'akhisar') {
        const deliverySectionRegex = /<section class="delivery-zone">[\s\S]*?<\/section>/;
        const newDeliverySection = `
        <section class="delivery-zone">
            <h2>${simpleName.toUpperCase()} HIZLI TESLİMAT</h2>
            <p>Siparişiniz <strong>${simpleName}</strong> ve tüm ilçelerine <strong>aynı gün kargo</strong> ile gizli paket olarak gönderilir.</p>
            <div class="delivery-features">
                <div>🚚 Aynı Gün Kargo</div>
                <div>🕵️ %100 Gizli Paketleme</div>
                <div>💳 Güvenli Ödeme</div>
            </div>
            <div class="neighborhoods">
                <strong>Teslimat:</strong> ${simpleName} genelindeki tüm adreslere, 1 ⚡ Akhisar Merkez 1 Saatte %100 Gizli Teslimat güvencesiyle teslimat yapılmaktadır.<br>
                <strong>Şube Teslim:</strong> Dilerseniz kargonuzu en yakın teslimat noktasından kimliğinizle teslim alabilirsiniz.<br>
                <strong>Ortalama Süre:</strong> 1-3 İş Günü
            </div>
        </section>`;
        content = content.replace(deliverySectionRegex, newDeliverySection);

        content = content.replace(/Akhisar İçi 1 Saat Teslimat/g, "Hızlı ve Gizli Kargo");
        content = content.replace(/1 Saat Teslimat/g, "Hızlı Kargo");
        content = content.replace(/SADECE 1 SAAT/g, "EN KISA SÜREDE");

        // REMOVE Motor Kurye references for non-Akhisar
        content = content.replace(/MOTORLU KURYE/g, "ÖZEL PAKETLEME");
        content = content.replace(/Motor kurye ile hızlı teslimat sağlanan bölgeler/g, "Anlaşmalı kargo ile Türkiye'nin her yerine gönderim");
        content = content.replace(/Sütçüler içi motor kurye ile 1 saat./g, "Aynı gün gizli kargo ile gönderim.");
        content = content.replace(/.*motor kurye ile 1 saat.*/g, "Aynı gün gizli kargo ile gönderim.");

        // REMOVE Kapıda Ödeme references for non-Akhisar
        content = content.replace(/💵 Kapıda Ödeme ✅/g, ""); // Remove from trust row
        content = content.replace(/<div>💵 Kapıda Ödeme<\/div>/g, ""); // Remove from hero features
        content = content.replace(/Kapıda Ödeme & /g, ""); // Remove from sub-hero
        content = content.replace(/kapıda ödeme,/g, ""); // Remove from text flow
        content = content.replace(/Kapıda ödeme var mı\?<\/summary>\s*<p>.*?<\/p>/g, "Kapıda ödeme var mı?</summary><p>Şu an için sadece Havale/EFT ve Online Kredi Kartı ile ödeme kabul etmekteyiz.</p>"); // Replace FAQ
        content = content.replace(/dilerseniz kapıda ödeme,/g, ""); // Remove from payment text

        content = content.replace(/1 Saatte Teslim/g, "Aynı Gün Kargo");
        content = content.replace(/<span>🚚 .*?<\/span>/, "<span>🚚 Aynı Gün Gizli Kargo ✅</span>");

        // Remove Akhisar specific "KARGO YOK" text if it lingers
        content = content.replace(/Akhisar içi KARGO YOK!/g, "Anlaşmalı kargo ile gönderim.");
        content = content.replace(/Sütçüler içi KARGO YOK!/g, "Tüm Türkiye'ye Kargo İmkanı"); // Dynamic name replacement might have created this
        content = content.replace(new RegExp(`${simpleName} içi KARGO YOK!`, 'g'), "Tüm Türkiye'ye Kargo İmkanı");
    }

    content = content.replace(/akhisar-sex-shop\.html/g, `${citySlug}-sex-shop.html`);
    // SEO Fix: Eğer içerikte .html uzantılı linkler kaldıysa (template'den gelen), onları da temizle
    content = content.replace(/href="\/([^"]+)\.html"/g, 'href="/$1"');

    // Force clean URL in canonical tag
    const cleanCanonical = `https://gizlikutu.online/${citySlug}-sex-shop`;
    content = content.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${cleanCanonical}">`);

    return { filename: `${citySlug}-sex-shop.html`, content: content };
}

// Generate
const generatedFiles = [];
cities.forEach(city => {
    // Province
    const provinceData = processTemplate(city.name, true, city.name);
    fs.writeFileSync(path.join(outputDir, provinceData.filename), provinceData.content);
    generatedFiles.push(provinceData.filename);

    // Districts - ONLY AKHISAR
    if (city.districts && city.districts.length > 0) {
        city.districts.forEach(dist => {
            if (dist === "Akhisar") {
                const distData = processTemplate(dist, false, city.name);
                fs.writeFileSync(path.join(outputDir, distData.filename), distData.content);
                generatedFiles.push(distData.filename);
            }
        });
    }
});

console.log(`Total ${generatedFiles.length} files generated.`);

// Sitemap
const sitemapPath = path.join(outputDir, 'sitemap.xml');
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const sitemapInsertionPoint = '</urlset>';
let newSitemapLinks = "";

generatedFiles.forEach(fname => {
    const cleanFName = fname.replace('.html', '');
    const url = `https://gizlikutu.online/${cleanFName}`;
    if (!sitemapContent.includes(url)) {
        newSitemapLinks += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
});

if (newSitemapLinks) {
    const newSitemapContent = sitemapContent.replace(sitemapInsertionPoint, newSitemapLinks + sitemapInsertionPoint);
    fs.writeFileSync(sitemapPath, newSitemapContent);
    console.log("Sitemap updated with Clean URLs.");
} else {
    console.log("Sitemap already up to date.");
}
