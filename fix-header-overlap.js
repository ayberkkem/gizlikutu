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

// CSS Düzeltmesi
// Logo (Resim + Yazı) ile WhatsApp ikonu ve yazı satırlarını ayırıyoruz.
const fixCSS = `
<style>
/* HEADER LOGO & WHATSAPP OVERLAP FIX */
.header-row .logo {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important; 
    margin-right: 15px !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
}
.header-row .logo span {
    line-height: normal !important;
    display: inline-block !important;
}
/* WhatsApp Ikonunu biraz sağa at */
.header-row a[href*="wa.me"] svg, 
.header-row .text-success svg {
    margin-left: 10px !important;
}
/* Arama çubuğu genişlik ayarı (Mobilde yer açmak için) */
@media (max-width: 600px) {
    .header-row {
        gap: 5px !important;
    }
    .header-row .logo span {
        font-size: 15px !important; /* Yazıyı biraz küçült */
    }
    .header-search {
        max-width: 140px !important;
    }
}
</style>
`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('/* HEADER LOGO & WHATSAPP OVERLAP FIX */')) {
        if (content.includes('</head>')) {
            content = content.replace('</head>', `${fixCSS}</head>`);
            fs.writeFileSync(file, content, 'utf8');
            count++;
        }
    }
});

console.log(`Header overlap CSS fix applied to ${count} files.`);
