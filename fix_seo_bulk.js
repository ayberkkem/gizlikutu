const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const updates = [
    { name: 'contact.html', desc: 'Gizli Kutu iletişim sayfası. WhatsApp, E-posta ve diğer iletişim kanallarımız.' },
    { name: 'blog.html', desc: 'Cinsel sağlık ve ürün rehberleri blogumuz. Merak ettikleriniz burada.' },
    { name: 'products.html', desc: 'Tüm ürünlerimizi inceleyin. Geniş ürün yelpazesi ve uygun fiyatlar.' },

    // Policy Pages
    { name: 'kvkk.html', desc: 'Kişisel verilerin korunması kanunu aydınlatma metni.' },
    { name: 'privacy.html', desc: 'Gizlilik politikamız ve veri güvenliği ilkelerimiz.' },
    { name: 'terms.html', desc: 'Kullanım koşulları ve site kuralları.' },
    { name: 'returns.html', desc: 'İade ve değişim koşulları hakkında bilgi alın.' },
    { name: 'distance-sales.html', desc: 'Mesafeli satış sözleşmesi detayları.' },
    { name: 'sss.html', desc: 'Sıkça sorulan sorular ve cevapları.' },
    { name: 'success.html', desc: 'Siparişiniz başarıyla alındı.' },

    // Categories
    { name: 'vibrator.html', desc: 'Kadınlar için en iyi vibratör modelleri. %100 gizli kargo.' },
    { name: 'dildo.html', desc: 'Realistik ve farklı boyutlarda dildo çeşitleri.' },
    { name: 'masturbator.html', desc: 'Erkekler için en iyi mastürbatör çeşitleri.' },
    { name: 'fantezi.html', desc: 'Fantezi iç giyim ve aksesuarlar.' },
    { name: 'jel.html', desc: 'Kayganlaştırıcı jeller ve masaj yağları.' },
    { name: 'masaj.html', desc: 'Rahatlatıcı masaj ürünleri.' },
    { name: 'titresim.html', desc: 'Titreşimli halkalar ve oyuncaklar.' },
    { name: 'realistik.html', desc: 'Gerçekçi dokuya sahip yetişkin oyuncakları.' },
    { name: 'manken.html', desc: 'Şişme mankenler ve suni bebekler.' },
    { name: 'cesur.html', desc: 'Cesur fantezi ürünleri.' },
    { name: 'erotik-giyim.html', desc: 'Kadın ve erkek erotik iç giyim ürünleri.' },
    { name: 'performans.html', desc: 'Cinsel performans arttırıcı ürünler.' }
];

updates.forEach(item => {
    const filePath = path.join(publicDir, item.name);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Add Canonical if missing
        const canonicalTag = `<link rel="canonical" href="https://gizlikutu.online/${item.name}">`;
        if (!content.includes('rel="canonical"')) {
            // Try to insert after other CSS links or before head end
            if (content.includes('</head>')) {
                content = content.replace('</head>', `    ${canonicalTag}\n</head>`);
                modified = true;
            }
        }

        // 2. Add Description if missing
        if (!content.includes('name="description"')) {
            const descTag = `<meta name="description" content="${item.desc}">`;
            // Insert after charset/viewport or before title, or generic head text
            if (content.includes('<head>')) {
                // Try to put it after viewport
                if (content.includes('name="viewport"')) {
                    content = content.replace(/" \/>/, `" />\n    ${descTag}`);
                } else {
                    content = content.replace('<head>', `<head>\n    ${descTag}`);
                }
                modified = true;
            }
        }

        // 3. Fix Privacy Page Img Alt specific
        if (item.name === 'privacy.html') {
            content = content.replace(/alt=""/g, 'alt="Gizlilik Politikası"');
            modified = true;
        }

        // 4. Products Page Canonical fix (sometimes generic list pages need careful handling)
        // (Handled by general rule above)

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${item.name}`);
        } else {
            console.log(`No changes needed for ${item.name}`);
        }
    } else {
        console.warn(`File not found: ${item.name}`);
    }
});
