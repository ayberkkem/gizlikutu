const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

function getAllHTMLFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllHTMLFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.html')) arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const htmlFiles = getAllHTMLFiles(publicDir);
let count = 0;

// COMPACT CSS: Her şeyi küçültür ve sığdırır.
const compactCSS = `
<style>
/* --- COMPACT HEADER FIX --- */
/* 1. Header Genel Boşluk */
#mainHeader .header-row {
    padding: 4px 0 !important; /* Dikey boşluğu ciddi oranda azalt */
    gap: 5px !important; /* Elemanlar arası boşluğu sıkıştır */
    flex-wrap: nowrap !important; /* Asla alt satıra geçmesin */
}

/* 2. Logo Küçültme */
#mainHeader .logo img {
    height: 26px !important; 
    width: 26px !important;
    border-radius: 4px !important;
}
#mainHeader .logo span {
    font-size: 14px !important; /* Yazıyı küçült */
    font-weight: 700 !important;
}

/* 3. WhatsApp İkon Küçültme */
#mainHeader .text-success svg {
    width: 20px !important;
    height: 20px !important;
    margin-left: 5px !important;
}

/* 4. Arama Çubuğu İnceltme */
#mainHeader input[type="search"] {
    height: 32px !important;
    font-size: 12px !important;
    padding: 0 10px !important;
}

/* 5. Butonları Küçültme (Navigasyon) */
#mainHeader a.btn, 
#mainHeader button.btn {
    padding: 0 8px !important; /* İç boşluğu azalt */
    font-size: 11px !important;   /* Yazıyı küçült */
    height: 28px !important;      /* Yüksekliği sabitle */
    line-height: 28px !important;
    display: inline-flex !important;
    align-items: center !important;
    white-space: nowrap !important;
}

/* 6. Sepet İkonu Ayarı */
#mainHeader .position-relative svg {
    width: 18px !important;
    height: 18px !important;
}
</style>
`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Zaten ekli değilse ekle
    if (!content.includes('/* --- COMPACT HEADER FIX --- */')) {
        if (content.includes('</head>')) {
            content = content.replace('</head>', `${compactCSS}</head>`);
            fs.writeFileSync(file, content, 'utf8');
            count++;
        }
    }
});

console.log(`Compact Header CSS applied to ${count} files.`);
