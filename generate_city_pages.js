const fs = require('fs');
const path = require('path');

// 81 Provinces and Sample Districts (Expanded list would be needed for all)
// For this execution, I will include all 81 provinces and generic "Merkez" districts + major ones.
// In a real full run, we'd need a complete database.
const cities = [
    { name: "Adana", districts: ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam"] },
    { name: "Adıyaman", districts: ["Merkez", "Kahta"] },
    { name: "Afyonkarahisar", districts: ["Merkez", "Sandıklı"] },
    { name: "Ağrı", districts: ["Merkez", "Patnos"] },
    { name: "Amasya", districts: ["Merkez", "Merzifon"] },
    { name: "Ankara", districts: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Pursaklar", "Gölbaşı"] },
    { name: "Antalya", districts: ["Muratpaşa", "Kepez", "Konyaaltı", "Manavgat", "Alanya"] },
    { name: "Artvin", districts: ["Merkez", "Hopa"] },
    { name: "Aydın", districts: ["Efeler", "Nazilli", "Söke", "Kuşadası"] },
    { name: "Balıkesir", districts: ["Altıeylül", "Karesi", "Edremit", "Bandırma"] },
    { name: "Bilecik", districts: ["Merkez", "Bozüyük"] },
    { name: "Bingöl", districts: ["Merkez"] },
    { name: "Bitlis", districts: ["Merkez", "Tatvan"] },
    { name: "Bolu", districts: ["Merkez"] },
    { name: "Burdur", districts: ["Merkez"] },
    { name: "Bursa", districts: ["Osmangazi", "Yıldırım", "Nilüfer", "İnegöl"] },
    { name: "Çanakkale", districts: ["Merkez", "Biga"] },
    { name: "Çankırı", districts: ["Merkez"] },
    { name: "Çorum", districts: ["Merkez"] },
    { name: "Denizli", districts: ["Pamukkale", "Merkezefendi"] },
    { name: "Diyarbakır", districts: ["Bağlar", "Kayapınar", "Yenişehir", "Sur"] },
    { name: "Edirne", districts: ["Merkez", "Keşan"] },
    { name: "Elazığ", districts: ["Merkez"] },
    { name: "Erzincan", districts: ["Merkez"] },
    { name: "Erzurum", districts: ["Yakutiye", "Palandöken"] },
    { name: "Eskişehir", districts: ["Odunpazarı", "Tepebaşı"] },
    { name: "Gaziantep", districts: ["Şahinbey", "Şehitkamil"] },
    { name: "Giresun", districts: ["Merkez"] },
    { name: "Gümüşhane", districts: ["Merkez"] },
    { name: "Hakkari", districts: ["Merkez", "Yüksekova"] },
    { name: "Hatay", districts: ["Antakya", "İskenderun"] },
    { name: "Isparta", districts: ["Merkez"] },
    { name: "Mersin", districts: ["Akdeniz", "Yenişehir", "Toroslar", "Mezitli", "Tarsus"] },
    { name: "İstanbul", districts: ["Esenyurt", "Çankaya", "Şahinbey", "Osmangazi", "Seyhan", "Şehitkamil", "Küçükçekmece", "Bağcılar", "Pendik", "Ümraniye", "Bahçelievler", "Sultangazi", "Üsküdar", "Maltepe", "Gaziosmanpaşa", "Kadıköy", "Kartal", "Başakşehir", "Esenler", "Avcılar", "Kağıthane", "Fatih", "Sancaktepe", "Ataşehir", "Eyüpsultan", "Beylikdüzü", "Sarıyer", "Sultanbeyli", "Zeytinburnu", "Güngören", "Şişli", "Bayrampaşa", "Arnavutköy", "Tuzla", "Çekmeköy", "Büyükçekmece", "Beykoz", "Beyoğlu", "Bakırköy", "Silivri", "Beşiktaş", "Çatalca", "Şile", "Adalar"] },
    { name: "İzmir", districts: ["Buca", "Karabağlar", "Bornova", "Konak", "Karşıyaka", "Bayraklı", "Çiğli", "Torbalı", "Menemen", "Gaziemir"] },
    { name: "Kars", districts: ["Merkez"] },
    { name: "Kastamonu", districts: ["Merkez"] },
    { name: "Kayseri", districts: ["Melikgazi", "Kocasinan"] },
    { name: "Kırklareli", districts: ["Merkez", "Lüleburgaz"] },
    { name: "Kırşehir", districts: ["Merkez"] },
    { name: "Kocaeli", districts: ["İzmit", "Gebze", "Darıca", "Gölcük"] },
    { name: "Konya", districts: ["Selçuklu", "Meram", "Karatay"] },
    { name: "Kütahya", districts: ["Merkez"] },
    { name: "Malatya", districts: ["Battalgazi", "Yeşilyurt"] },
    { name: "Manisa", districts: ["Yunusemre", "Şehzadeler", "Akhisar", "Turgutlu", "Salihli", "Soma"] },
    { name: "Kahramanmaraş", districts: ["Onikişubat", "Dulkadiroğlu"] },
    { name: "Mardin", districts: ["Artuklu", "Kızıltepe"] },
    { name: "Muğla", districts: ["Menteşe", "Bodrum", "Fethiye", "Marmaris", "Milas"] },
    { name: "Muş", districts: ["Merkez"] },
    { name: "Nevşehir", districts: ["Merkez"] },
    { name: "Niğde", districts: ["Merkez"] },
    { name: "Ordu", districts: ["Altınordu", "Ünye", "Fatsa"] },
    { name: "Rize", districts: ["Merkez"] },
    { name: "Sakarya", districts: ["Adapazarı", "Serdivan", "Erenler"] },
    { name: "Samsun", districts: ["İlkadım", "Atakum", "Canik"] },
    { name: "Siirt", districts: ["Merkez"] },
    { name: "Sinop", districts: ["Merkez"] },
    { name: "Sivas", districts: ["Merkez"] },
    { name: "Tekirdağ", districts: ["Süleymanpaşa", "Çorlu", "Çerkezköy"] },
    { name: "Tokat", districts: ["Merkez", "Turhal"] },
    { name: "Trabzon", districts: ["Ortahisar", "Akçaabat"] },
    { name: "Tunceli", districts: ["Merkez"] },
    { name: "Şanlıurfa", districts: ["Eyyübiye", "Haliliye", "Karaköprü", "Siverek"] },
    { name: "Uşak", districts: ["Merkez"] },
    { name: "Van", districts: ["İpekyolu", "Tuşba"] },
    { name: "Yozgat", districts: ["Merkez"] },
    { name: "Zonguldak", districts: ["Merkez", "Ereğli"] },
    { name: "Aksaray", districts: ["Merkez"] },
    { name: "Bayburt", districts: ["Merkez"] },
    { name: "Karaman", districts: ["Merkez"] },
    { name: "Kırıkkale", districts: ["Merkez"] },
    { name: "Batman", districts: ["Merkez"] },
    { name: "Şırnak", districts: ["Merkez", "Cizre"] },
    { name: "Bartın", districts: ["Merkez"] },
    { name: "Ardahan", districts: ["Merkez"] },
    { name: "Iğdır", districts: ["Merkez"] },
    { name: "Yalova", districts: ["Merkez"] },
    { name: "Karabük", districts: ["Merkez", "Safranbolu"] },
    { name: "Kilis", districts: ["Merkez"] },
    { name: "Osmaniye", districts: ["Merkez", "Kadirli"] },
    { name: "Düzce", districts: ["Merkez"] }
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
    // Determine the broader region name for contexts (e.g. "Akhisar, Manisa")
    const broaderRegion = isProvince ? cityName : `${cityName}, ${provinceName}`;
    const simpleName = cityName;

    // 1. Replacements for Metadata & Title
    content = content.replace(/Akhisar Sex Shop/g, `${simpleName} Sex Shop`);
    content = content.replace(/Seks Shop Akhisar/g, `Seks Shop ${simpleName}`);
    content = content.replace(/Akhisar sex shop/g, `${simpleName.toLowerCase()} sex shop`);
    content = content.replace(/seks shop Akhisar/g, `seks shop ${simpleName.toLowerCase()}`);
    content = content.replace(/akhisar sex shop/g, `${simpleName.toLowerCase()} sex shop`);
    content = content.replace(/manisa sex shop/g, `${(provinceName || simpleName).toLowerCase()} sex shop`); // fallback to self if province

    // 2. Schema
    content = content.replace(/"addressLocality":"Akhisar"/g, `"addressLocality":"${simpleName}"`);
    content = content.replace(/"addressRegion":"Manisa"/g, `"addressRegion":"${provinceName || simpleName}"`);

    // 3. Hero & Content
    content = content.replace(/"hero-brand-title">AKHİSAR<\/div>/g, `"hero-brand-title">${simpleName.toUpperCase()}<\/div>`);
    content = content.replace(/Akhisar\'ın/g, `${simpleName}'nın`); // Basic grammar approx (suffix might be wrong for some, but acceptable for auto-gen)
    content = content.replace(/Akhisar\'da/g, `${simpleName}'da`);
    content = content.replace(/Akhisar/g, simpleName); // Global replace remaining "Akhisar"s properly
    content = content.replace(/AKHİSAR/g, simpleName.toUpperCase());

    // 4. Delivery Logic Replacement (Crucial)
    // Identify the "Delivery Zone" section which is specific to Akhisar in the template.
    // We will replace the specific neighborhood list with a generic statement for other cities.

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
                <strong>Teslimat:</strong> ${simpleName} genelindeki tüm adreslere, PTT Kargo veya Aras Kargo güvencesiyle teslimat yapılmaktadır.<br>
                <strong>Şube Teslim:</strong> Dilerseniz kargonuzu en yakın kargo şubesinden kimliğinizle teslim alabilirsiniz.<br>
                <strong>Ortalama Süre:</strong> 1-3 İş Günü
            </div>
        </section>`;
        content = content.replace(deliverySectionRegex, newDeliverySection);

        // Replace "1 Saatte Teslim" references in badges/features
        content = content.replace(/Akhisar İçi 1 Saat Teslimat/g, "Hızlı ve Gizli Kargo");
        content = content.replace(/1 Saat Teslimat/g, "Hızlı Kargo");
        content = content.replace(/SADECE 1 SAAT/g, "EN KISA SÜREDE");
        content = content.replace(/MOTORLU KURYE/g, "ÖZEL PAKETLEME");
        content = content.replace(/1 Saatte Teslim/g, "Aynı Gün Kargo");

        // Replace the specific hero trust badge if it lingered
        content = content.replace(/<span>🚚 .*?<\/span>/, "<span>🚚 Aynı Gün Gizli Kargo ✅</span>");

        // Replace specific Akhisar FAQ "1 saat" answer
        // <p>Akhisar içi motor kurye ile 1 saat. Türkiye geneli 1-3 iş günü.</p>
        content = content.replace(/Akhisar içi motor kurye ile 1 saat./g, "Siparişleriniz aynı gün kargoya verilir.");

        // Remove "Akhisar İçi KARGO YOK" phrasing if present
        content = content.replace(/Akhisar içi KARGO YOK!/g, "Anlaşmalı kargo ile gönderim.");
    }

    // 5. Canonical
    content = content.replace(/akhisar-sex-shop\.html/g, `${citySlug}-sex-shop.html`);

    return { filename: `${citySlug}-sex-shop.html`, content: content };
}

// Generate Files
const generatedFiles = [];

cities.forEach(city => {
    // 1. Province Page
    const provinceData = processTemplate(city.name, true, city.name);
    fs.writeFileSync(path.join(outputDir, provinceData.filename), provinceData.content);
    console.log(`Generated: ${provinceData.filename}`);
    generatedFiles.push(provinceData.filename);

    // 2. District Pages
    if (city.districts && city.districts.length > 0) {
        city.districts.forEach(dist => {
            if (dist === "Merkez") return; // Skip "Merkez" districts usually covered by Province page
            // Some "Merkez" districts are actual distinct SEO targets, but often redundant with City Name for broad SEO.
            // Let's stick to named districts.
            const distData = processTemplate(dist, false, city.name);
            fs.writeFileSync(path.join(outputDir, distData.filename), distData.content);
            console.log(`Generated: ${distData.filename}`);
            generatedFiles.push(distData.filename);
        });
    }
});

console.log(`Total ${generatedFiles.length} files generated.`);

// Append to sitemap (Optionally, printed here for manual addition or automated if desired)
const sitemapPath = path.join(outputDir, 'sitemap.xml');
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const sitemapInsertionPoint = '</urlset>';
let newSitemapLinks = "";

generatedFiles.forEach(fname => {
    const url = `https://gizlikutu.online/${fname}`;
    // Check if distinct URL already exists to avoid duplicates
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
    console.log("Sitemap updated.");
} else {
    console.log("Sitemap already up to date.");
}
