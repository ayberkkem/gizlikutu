const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const files = getAllFiles(publicDir).filter(f => f.endsWith('.html'));

// ==========================================
// 1. NON-AKHİSAR (KARGO) ŞABLONLARI (FİRMA ÇEŞİTLİLİĞİ İLE - GÜVENLİ SÜRELER)
// ==========================================
const cargoDeliveryTemplates = [
    (city) => `
        <h2>${city} ARAS KARGO İLE GÖNDERİM</h2>
        <p>Gizli Kutu siparişleriniz <strong>${city}</strong> bölgesine <strong>Aras Kargo</strong> güvencesiyle %100 gizli paket olarak gönderilir.</p>
        <div class="delivery-features">
            <div>📦 Kapalı Kutu</div>
            <div>🚚 Aras Kargo</div>
            <div>💳 Online/Havale</div>
        </div>
        <div class="neighborhoods">
            <strong>Teslimat Süreci:</strong> ${city} genelinde Aras Kargo şubelerinden veya adrese teslim.<br>
            <strong>Gizlilik:</strong> Kargo poşetinde ürün içeriği asla yazmaz.<br>
            <strong>Süre:</strong> Bölgeye göre ortalama 1-3 iş günü.
        </div>
    `,
    (city) => `
        <h2>${city} YURTİÇİ KARGO GÜVENCESİ</h2>
        <p><strong>${city}</strong> siparişlerinizde <strong>Yurtiçi Kargo</strong> ile hızlı ve güvenli gönderim sağlıyoruz. Kimse ne aldığınızı bilmez.</p>
        <div class="delivery-features">
            <div>🚀 Hızlı Gönderi</div>
            <div>🔒 Tam Gizlilik</div>
            <div>✅ Yurtiçi Kargo</div>
        </div>
        <div class="neighborhoods">
            <strong>Kargo:</strong> Siparişiniz özenle hazırlanıp Yurtiçi Kargo'ya verilir.<br>
            <strong>${city} Teslimat:</strong> Bulunduğunuz bölgeye göre 1 ile 3 iş günü arası sürer.<br>
            <strong>Ödeme:</strong> Sitemizden güvenli kredi kartı ile öÖdeme yapabilirsiniz.
        </div>
    `,
    (city) => `
        <h2>${city} PTT KARGO İLE HER YERE TESLİMAT</h2>
        <p><strong>${city}</strong> dahil Türkiye'nin en ücra köşesine <strong>PTT Kargo</strong> ile gizli gönderim yapıyoruz.</p>
        <div class="delivery-features">
            <div>🕵️ Logosuz Paket</div>
            <div>📦 PTT Kargo</div>
            <div>💳 256-Bit SSL</div>
        </div>
        <div class="neighborhoods">
            <strong>Nasıl Gelir?</strong> Kargo görevlisi dahi paketin içinde ne olduğunu bilmez.<br>
            <strong>${city} Varış:</strong> PTT Kargo ile ortalama 2-4 iş günü.<br>
            <strong>Şube Teslim:</strong> Dilerseniz PTT şubesinden kimliğinizle teslim alabilirsiniz.
        </div>
    `,
    (city) => `
        <h2>${city} UPS KARGO İLE PREMİUM GÖNDERİM</h2>
        <p>Siparişiniz <strong>${city}</strong> adresinize <strong>UPS Kargo</strong> kalitesiyle ve tamamen kamufle edilmiş kutuda gelir.</p>
        <div class="delivery-features">
            <div>🚀 UPS Hızlı</div>
            <div>🔒 Gizli Paket</div>
            <div>✅ Güvenli Alışveriş</div>
        </div>
        <div class="neighborhoods">
            <strong>Teslimat:</strong> ${city} bölgesine UPS Kargo ile 1-3 iş günü içinde teslim.<br>
            <strong>Gizlilik:</strong> Tamamen şeffaf olmayan paketleme.<br>
            <strong>Takip:</strong> Kargo takip numarası ile anlık izleme.
        </div>
    `,
    (city) => `
        <h2>${city} MNG KARGO İLE GÜVENLİ TESLİMAT</h2>
        <p><strong>${city}</strong> için verdiğiniz siparişler <strong>MNG Kargo</strong> ile özenle paketlenip yola çıkar.</p>
        <div class="delivery-features">
            <div>📦 MNG Kargo</div>
            <div>🔒 %100 Gizlilik</div>
            <div>💳 Hızlı Ödeme</div>
        </div>
        <div class="neighborhoods">
            <strong>Süreç:</strong> MNG Kargo ile 1-3 iş günü içinde kapınızda.<br>
            <strong>Paketleme:</strong> Dışarıdan asla belli olmaz.<br>
            <strong>Opsiyon:</strong> İsterseniz size en yakın MNG şubesinden teslim alabilirsiniz.
        </div>
    `
];

// ==========================================
// 2. AKHİSAR (KURYE) ŞABLONU (SABİT)
// ==========================================
const akhisarDeliveryTemplate = `
    <h2>AKHİSAR İÇİ AYNI GÜN TESLİMAT</h2>
    <p>Siparişiniz <strong>Akhisar</strong> merkez mahallelerine özel motor kuryemiz ile <strong>30-60 dakikada</strong> teslim edilir.</p>
    <div class="delivery-features">
        <div>🏍️ Motor Kurye</div>
        <div>💵 Kapıda Ödeme</div>
        <div>⚡ Anında Teslim</div>
    </div>
    <div class="neighborhoods">
        <strong>Hizmet Bölgesi:</strong> Akhisar Merkez, Efendi, Hürriyet, Atatürk, İnönü Mahalleleri.<br>
        <strong>Köy/Kasaba:</strong> Merkeze uzak bölgelere anlaşmalı kargo ile gönderim yapılır.<br>
        <strong>Ödeme:</strong> Kapıda Nakit veya Kredi Kartı geçerlidir.
    </div>
`;

// ==========================================
// 3. INTRO (GİRİŞ) TEXT ŞABLONLARI
// ==========================================
const introTemplates = [
    (city) => `${city} şehrine özel gizli paketleme ve güvenli alışverişin adresi. %100 müşteri memnuniyeti.`,
    (city) => `${city} için en geniş ürün yelpazesi, uygun fiyatlar ve tam gizlilik garantisi.`,
    (city) => `${city} bölgesinde kimse bilmeden, güvenle alışveriş yapın. Hızlı kargo seçenekleri.`,
    (city) => `Türkiye'nin her yerine olduğu gibi ${city} iline de sorunsuz, logosuz teslimat.`
];

let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const filename = path.basename(file).toLowerCase();

    // Şehir ismini bul
    let cityName = "Türkiye";
    const titleMatch = content.match(/<div class="hero-brand-title">(.*?)<\/div>/);
    if (titleMatch) {
        cityName = titleMatch[1].trim();
    } else {
        if (filename.includes('-sex-shop.html')) {
            const rawName = filename.replace('-sex-shop.html', '');
            cityName = rawName.charAt(0).toUpperCase() + rawName.slice(1).replace(/-/g, ' ');
        }
    }
    if (cityName.length > 20) cityName = "Türkiye";

    // Akhisar Kontrolü
    const isAkhisar = filename.includes('akhisar');

    // 1. Delivery Zone Değiştir
    const deliveryRegex = /<section class="delivery-zone">[\s\S]*?<\/section>/;

    let newDeliveryHTML = "";
    if (isAkhisar) {
        newDeliveryHTML = `<section class="delivery-zone">${akhisarDeliveryTemplate}</section>`;
    } else {
        const randomTpl = cargoDeliveryTemplates[Math.floor(Math.random() * cargoDeliveryTemplates.length)];
        newDeliveryHTML = `<section class="delivery-zone">${randomTpl(cityName)}</section>`;
    }

    let newContent = content.replace(deliveryRegex, newDeliveryHTML);

    // 2. Intro Text Değiştir
    const introRegex = /<p style="color:var\(--muted\);margin:0 0 12px">[\s\S]*?<\/p>/;

    if (!isAkhisar) {
        const randomIntro = introTemplates[Math.floor(Math.random() * introTemplates.length)];
        const newIntroHTML = `<p style="color:var(--muted);margin:0 0 12px">${randomIntro(cityName)}</p>`;
        newContent = newContent.replace(introRegex, newIntroHTML);
    }

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
    }
});

console.log(`Content spinned (SAFE DURATION & CARGO NAMES) for ${count} files.`);
