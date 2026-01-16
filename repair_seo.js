const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// --- HELPER FUNCTION TO FIX PAGE ---
function fixPage(fileDetails) {
    const filePath = path.join(publicDir, fileDetails.name);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${fileDetails.name}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Fix missing or multiple H1
    if (fileDetails.fixH1) {
        // Remove ALL H1 tags to start fresh if multiple exist
        content = content.replace(/<h1[^>]*>.*?<\/h1>/gi, '');

        // Find a good place to insert the correct H1
        // Usually inside <main class="..."> or after breadcrumbs
        if (content.includes('<main class="container">')) {
            content = content.replace('<main class="container">', `<main class="container">\n        <h1 class="page-title" style="margin-top:1rem;margin-bottom:1rem;font-size:1.8rem;color:#111">${fileDetails.title}</h1>`);
        } else if (content.includes('<div class="hero">')) {
            // Some pages have hero areas, check if they have h1
            if (!content.includes('<h1>')) {
                // Insert H1 into Hero
            }
        }
    }

    // 2. Fix Canonical
    if (!content.includes('rel="canonical"')) {
        const canonicalTag = `<link rel="canonical" href="https://gizlikutu.online/${fileDetails.name}">`;
        if (content.includes('</head>')) {
            content = content.replace('</head>', `    ${canonicalTag}\n</head>`);
        }
    }

    // 3. Fix OG:Title
    if (!content.includes('property="og:title"')) {
        const ogTitleTag = `<meta property="og:title" content="${fileDetails.title} | Gizli Kutu">`;
        if (content.includes('</head>')) {
            content = content.replace('</head>', `    ${ogTitleTag}\n</head>`);
        }
    }

    // 4. Fix Meta Description
    if (!content.includes('name="description"')) {
        const descTag = `<meta name="description" content="${fileDetails.desc}">`;
        if (content.includes('<head>')) {
            if (content.includes('name="viewport"')) {
                content = content.replace(/" \/>/, `" />\n    ${descTag}`);
            } else {
                content = content.replace('<head>', `<head>\n    ${descTag}`);
            }
        }
    }

    // 5. Special Fix for Multiple H1 in Blogs
    // Blogs often have <h1 class="blog-title"> inside the card list which is WRONG. Those should be H2.
    // And the page should have ONE main H1.
    if (fileDetails.isBlog) {
        // Fix card titles: <h1 class="blog-title"> -> <h2 class="blog-title">
        const cardTitleRegex = /<h1 class="blog-title">/g;
        if (cardTitleRegex.test(content)) {
            content = content.replace(/<h1 class="blog-title">/g, '<h2 class="blog-title">');
            content = content.replace(/<\/h1>/g, '</h2>'); // This is risky, need more precise replace

            // Re-read file to do precise replacement to avoid breaking legitimate h1
            // Strategy: replace specific block pattern
            content = originalContent.replace(/<h1 class="blog-title">(.*?)<\/h1>/g, '<h2 class="blog-title">$1</h2>');
        }

        // Ensure Main H1 Exists
        if (!content.match(/<h1/i)) {
            // Add Main H1 if missing (often missing in blog detail pages if we stripped them)
            // ... logic handled by step 1 if fixH1 is true
        }
    }

    // 6. Fix Alt Tags
    // A generic fix is hard, but we can patch specific known missing ones.
    // For now, we will add empty alt="" to images that have none, to at least validate HTML, 
    // or use filename.
    content = content.replace(/<img\s+(?![^>]*\balt=)[^>]*?>/gi, (match) => {
        return match.replace('<img', '<img alt="Gizli Kutu Görsel"');
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${fileDetails.name}`);
    } else {
        console.log(`No changes: ${fileDetails.name}`);
    }
}

// --- DATA LIST ---
// Only listing the problematic files found in report
const filesToFix = [
    { name: 'blog.html', title: 'Cinsel Sağlık Blogu', desc: 'En güncel cinsel sağlık rehberleri ve ürün incelemeleri.', fixH1: true, isBlog: true },
    { name: 'about.html', title: 'Hakkımızda', desc: 'Gizli Kutu hakkında bilmeniz gereken her şey.', fixH1: false }, // Has H1

    // Blog Posts (They often have multiple H1s inside "Read More" cards at bottom)
    { name: 'blog-alisveris-dikkat.html', title: 'Alışveriş Yaparken Dikkat Edilmesi Gerekenler', desc: 'Sex shop alışverişlerinizde güvenli ve doğru tercih yapmanın ipuçları.', isBlog: true },
    { name: 'blog-anorgazmi.html', title: 'Anorgazmi Nedir?', desc: 'Orgazm olamama sorunu ve çözüm önerileri.', isBlog: true },
    { name: 'blog-atesleyici-bilgiler.html', title: 'Ateşleyici Bilgiler', desc: 'Cinsel hayatınızı canlandıracak bilgiler.', isBlog: true },
    { name: 'blog-az-bilinen-orgazm.html', title: 'Az Bilinen Orgazm Gerçekleri', desc: 'Orgazm hakkında şaşırtıcı bilgiler.', isBlog: true },
    { name: 'blog-cesur-rehberi.html', title: 'Cesur Ürünler Rehberi', desc: 'BDSM ve fantezi ürünleri hakkında rehber.', isBlog: true },
    { name: 'blog-cilt-ve-orgazm.html', title: 'Cilt Güzelliği ve Orgazm', desc: 'Düzenli cinsel yaşamın cildinize faydaları.', isBlog: true },
    { name: 'blog-dildo-rehberi.html', title: 'Dildo Seçim Rehberi', desc: 'Doğru dildo boyutu ve materyali nasıl seçilir?', isBlog: true },
    { name: 'blog-erkek-urunleri.html', title: 'Erkekler İçin Ürünler', desc: 'Erkek cinsel sağlık ürünleri ve oyuncakları.', isBlog: true },
    { name: 'blog-fantezi-rehberi.html', title: 'Fantezi Giyim Rehberi', desc: 'Fantezi iç giyim seçerken nelere dikkat etmeli?', isBlog: true },
    { name: 'blog-g-noktasi.html', title: 'G Noktası Hakkında Her Şey', desc: 'G noktası nerede ve nasıl uyarılır?', isBlog: true },
    { name: 'blog-kadin-masturbasyon.html', title: 'Kadın Mastürbasyon Teknikleri', desc: 'Kadınlar için haz dolu mastürbasyon ipuçları.', isBlog: true },
    { name: 'blog-kayganlastirici-rehberi.html', title: 'Kayganlaştırıcı Rehberi', desc: 'Su bazlı, silikon veya anal kayganlaştırıcı seçimi.', isBlog: true },
    { name: 'blog-kolaylastirici-yontemler.html', title: 'Orgazmı Kolaylaştıran Yöntemler', desc: 'Daha kolay orgazm olmak için teknikler.', isBlog: true },
    { name: 'blog-manken-rehberi.html', title: 'Şişme Manken Rehberi', desc: 'Cinsel manken ve şişme bebekler hakkında bilgiler.', isBlog: true },
    { name: 'blog-masaj-rehberi.html', title: 'Masaj Yağları Rehberi', desc: 'Erotik masaj yağları ve kullanım teknikleri.', isBlog: true },
    { name: 'blog-masturbator-rehberi.html', title: 'Mastürbatör Seçimi', desc: 'Erkekler için en iyi mastürbatör modelleri.', isBlog: true },
    { name: 'blog-neden-orgazm-olamiyorsun.html', title: 'Neden Orgazm Olamıyorsun?', desc: 'Orgazm sorunlarının nedenleri ve çözümleri.', isBlog: true },
    { name: 'blog-neden-yatirim-yapmaliyiz.html', title: 'Neden Sex Shop Ürünleri?', desc: 'Cinsel oyuncaklara yatırım yapmanın faydaları.', isBlog: true },
    { name: 'blog-oral-seks.html', title: 'Oral Seks İpuçları', desc: 'Daha iyi bir oral seks deneyimi için tüyolar.', isBlog: true },
    { name: 'blog-orgazm-pozisyonlari.html', title: 'Orgazm Pozisyonları', desc: 'Kadınlar için orgazmı kolaylaştıran pozisyonlar.', isBlog: true },
    { name: 'blog-oyuncak-rehberi.html', title: 'Oyuncak Bakım Rehberi', desc: 'Seks oyuncaklarının temizliği ve bakımı.', isBlog: true },
    { name: 'blog-performans-rehberi.html', title: 'Performans Artırıcılar', desc: 'Geciktirici ve sertleştirici ürün rehberi.', isBlog: true },
    { name: 'blog-realistik-rehberi.html', title: 'Realistik Doku Nedir?', desc: 'Gerçekçi dokuya sahip ürünler hakkında bilgi.', isBlog: true },
    { name: 'blog-ruh-hali-faydalari.html', title: 'Seks Oyuncaklarının Faydaları', desc: 'Cinsel sağlığın ruh haline etkileri.', isBlog: true },
    { name: 'blog-titresim-rehberi.html', title: 'Titreşimli Oyuncaklar', desc: 'Vibratör ve titreşimli halka çeşitleri.', isBlog: true },
    { name: 'blog-vibrator-rehberi.html', title: 'Vibratör Seçim Rehberi', desc: 'Yeni başlayanlar için vibratör seçimi.', isBlog: true },
    { name: 'blog-yatak-odasi-sirlari.html', title: 'Yatak Odası Sırları', desc: 'Partnerinizle uyumu yakalamanın yolları.', isBlog: true },
    { name: 'blog-zevk-noktalari.html', title: 'Vücuttaki Zevk Noktaları', desc: 'Bilinmeyen erojen bölgeler.', isBlog: true },
];

filesToFix.forEach(fixPage);
