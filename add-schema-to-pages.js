/**
 * SEO Schema.org Structured Data Injector
 * Tüm sayfalara profesyonel JSON-LD schema ekler
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

// Türkçe karakter düzeltme
function toTitleCase(str) {
    const map = {
        'i': 'İ', 'ı': 'I', 'ş': 'Ş', 'ğ': 'Ğ', 'ü': 'Ü', 'ö': 'Ö', 'ç': 'Ç'
    };
    return str
        .split('-')
        .map(word => {
            if (!word) return '';
            const first = word[0];
            const upper = map[first] || first.toUpperCase();
            return upper + word.slice(1);
        })
        .join(' ');
}

// Şehir sayfaları için schema
function getCitySchema(cityName, fileName) {
    const cityTitle = toTitleCase(cityName);
    const url = `https://gizlikutu.online/${fileName}`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Anasayfa",
                        "item": "https://gizlikutu.online/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": `${cityTitle} Sex Shop`,
                        "item": url
                    }
                ]
            },
            {
                "@type": "CollectionPage",
                "@id": `${url}#collection`,
                "name": `${cityTitle} Sex Shop`,
                "description": `${cityTitle} sex shop, gizli paketleme ile güvenli alışveriş. %100 gizlilik garantisi.`,
                "url": url,
                "isPartOf": {
                    "@id": "https://gizlikutu.online/#website"
                },
                "about": {
                    "@type": "Thing",
                    "name": "Yetişkin Ürünleri"
                }
            },
            {
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": `${cityTitle}'da sex shop var mı?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Evet, Gizli Kutu olarak ${cityTitle} ve Manisa genelinde online hizmet veriyoruz. WhatsApp: +90 540 044 3445`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Siparişler gizli mi gönderiliyor?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Evet, tüm siparişler %100 gizli paketleme ile, logosuz ve içeriği belli olmayan ambalajla gönderilir."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Teslimat süresi ne kadar?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Manisa ve Akhisar genelinde 1-3 iş günü içinde teslimat sağlanmaktadır. Akhisar içi motor kurye ile 1 saat."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Kapıda ödeme seçeneği var mı?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Akhisar ve Manisa içi teslimatlarımızda kapıda nakit ödeme yapabilirsiniz. Detaylı bilgi için WhatsApp üzerinden ulaşabilirsiniz."
                        }
                    }
                ]
            }
        ]
    };
}

// Blog sayfaları için schema
function getBlogSchema(title, fileName, description) {
    const url = `https://gizlikutu.online/${fileName}`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Anasayfa",
                        "item": "https://gizlikutu.online/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Blog",
                        "item": "https://gizlikutu.online/blog.html"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": title,
                        "item": url
                    }
                ]
            },
            {
                "@type": "BlogPosting",
                "@id": `${url}#article`,
                "headline": title,
                "description": description,
                "datePublished": "2026-01-16T00:00:00+03:00",
                "dateModified": "2026-01-17T00:00:00+03:00",
                "author": {
                    "@type": "Organization",
                    "name": "Gizli Kutu",
                    "@id": "https://gizlikutu.online/#organization"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Gizli Kutu",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://gizlikutu.online/assets/logo.jpg",
                        "width": 512,
                        "height": 512
                    }
                },
                "image": "https://gizlikutu.online/assets/logo.jpg",
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": url
                }
            }
        ]
    };
}

// Kategori sayfaları için schema
function getCategorySchema(categoryName, fileName) {
    const url = `https://gizlikutu.online/${fileName}`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Anasayfa",
                        "item": "https://gizlikutu.online/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Ürünler",
                        "item": "https://gizlikutu.online/products.html"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": categoryName,
                        "item": url
                    }
                ]
            },
            {
                "@type": "CollectionPage",
                "@id": `${url}#collection`,
                "name": `${categoryName} | Gizli Kutu`,
                "description": `${categoryName} ürünleri. Gizli paketleme, güvenli ödeme, hızlı teslimat.`,
                "url": url,
                "isPartOf": {
                    "@id": "https://gizlikutu.online/#website"
                }
            }
        ]
    };
}

// HTML'den title ve description çıkar
function extractMeta(content) {
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
        content.match(/<meta\s+content="([^"]+)"\s+name="description"/i);

    return {
        title: titleMatch ? titleMatch[1].split('|')[0].trim() : 'Gizli Kutu',
        description: descMatch ? descMatch[1] : ''
    };
}

// Mevcut schema kontrolü ve güncelleme
function hasEnhancedSchema(content) {
    // FAQPage veya BreadcrumbList içeriyorsa gelişmiş schema var demektir
    return content.includes('"@type":"FAQPage"') ||
        content.includes('"@type": "FAQPage"') ||
        content.includes('"BreadcrumbList"');
}

// Schema'yı HTML'e ekle
function injectSchema(content, schema) {
    const schemaScript = `
  <!-- Schema.org Structured Data - Auto Generated -->
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2).split('\n').map(line => '  ' + line).join('\n')}
  </script>
</head>`;

    // Eğer mevcut bir LocalBusiness schema varsa, onu koru ve yeni schema'yı ekle
    // </head> etiketinden önce ekle
    if (content.includes('</head>')) {
        return content.replace('</head>', schemaScript);
    }
    return content;
}

// Ana işlem
async function processFiles() {
    let cityCount = 0;
    let blogCount = 0;
    let categoryCount = 0;
    let skippedCount = 0;

    const files = fs.readdirSync(PUBLIC_DIR);

    // Kategori isimleri
    const categoryMap = {
        'vibrator.html': 'Vibratörler',
        'masturbator.html': 'Mastürbatörler',
        'dildo.html': 'Dildolar',
        'jel.html': 'Kayganlaştırıcılar',
        'fantezi.html': 'Fantezi Ürünleri',
        'masaj.html': 'Masaj Ürünleri',
        'titresim.html': 'Titreşimli Ürünler',
        'cesur.html': 'Cesur Ürünler',
        'realistik.html': 'Realistik Ürünler',
        'manken.html': 'Gerçekçi Kadın',
        'performans.html': 'Performans Ürünleri',
        'erotik-giyim.html': 'Erotik Giyim'
    };

    for (const file of files) {
        if (!file.endsWith('.html')) continue;

        const filePath = path.join(PUBLIC_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Zaten gelişmiş schema varsa atla
        if (hasEnhancedSchema(content)) {
            skippedCount++;
            continue;
        }

        let schema = null;

        // Şehir sayfaları
        if (file.includes('-sex-shop.html')) {
            const cityName = file
                .replace('-sex-shop.html', '')
                .replace(/-merkez$/, '');
            schema = getCitySchema(cityName, file);
            cityCount++;
        }
        // Blog sayfaları
        else if (file.startsWith('blog-') && file !== 'blog.html') {
            const meta = extractMeta(content);
            schema = getBlogSchema(meta.title, file, meta.description);
            blogCount++;
        }
        // Kategori sayfaları
        else if (categoryMap[file]) {
            schema = getCategorySchema(categoryMap[file], file);
            categoryCount++;
        }

        if (schema) {
            content = injectSchema(content, schema);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file}`);
        }
    }

    console.log('\n========================================');
    console.log(`📊 İşlem Tamamlandı!`);
    console.log(`   Şehir Sayfaları: ${cityCount}`);
    console.log(`   Blog Yazıları: ${blogCount}`);
    console.log(`   Kategori Sayfaları: ${categoryCount}`);
    console.log(`   Atlanan (Zaten var): ${skippedCount}`);
    console.log(`   TOPLAM: ${cityCount + blogCount + categoryCount}`);
    console.log('========================================\n');
}

processFiles();
