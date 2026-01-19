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

// YENİ TEMİZ NAVİGASYON (Hakkımızda ve İletişim YOK)
const cleanNavHTML = `<nav class="desktop-header-nav">
          <a href="./index.html">Anasayfa</a>
          <a href="./products.html">Popüler Ürünler</a>
          <a href="./cities.html">Hizmet Bölgelerimiz</a>
          <a href="./blog.html">Blog</a>
        </nav>`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Navigasyon bloğunu bul ve tamamen değiştir.
    // Bu yöntem Regex'ten çok daha güvenlidir çünkü aradaki varyasyonları yok sayar.

    // Regex Açıklaması:
    // <nav class="desktop-header-nav"> : Başlangıç etiketi (boşluklara duyarlı olabilir diye esnek bırakmıyorum çünkü class sabit)
    // [\s\S]*? : Aradaki her şey (yeni satırlar dahil) - Lazy match
    // <\/nav> : Bitiş etiketi

    content = content.replace(/<nav class="desktop-header-nav">[\s\S]*?<\/nav>/gi, cleanNavHTML);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
    }
});

console.log(`Header navigation FORCE CLEANED in ${count} files.`);
