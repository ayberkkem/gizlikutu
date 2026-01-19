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

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Hakkımızda linkini sil
    // <a href="./about.html">Hakkımızda</a>
    content = content.replace(/<a[^>]*href="\.\/about\.html"[^>]*>.*?Hakkımızda.*?<\/a>/gi, '');

    // 2. İletişim linkini sil
    // <a href="./contact.html">İletişim</a>
    content = content.replace(/<a[^>]*href="\.\/contact\.html"[^>]*>.*?İletişim.*?<\/a>/gi, '');

    // 3. Arada kalan " • " işaretini temizle
    // Genellikle: </a> • <a href="./cities.html"> şeklindedir.
    // İletişim gidince " • <a href="./cities.html">" kalır.
    content = content.replace(/<\/a>\s*•\s*<a href="\.\/cities\.html"/gi, '</a> <a href="./cities.html"');

    // Veya sadece boşta kalan noktayı temizle
    content = content.replace(/\s•\s(?=<a)/g, ' ');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
    }
});

console.log(`Header links (About & Contact) removed from ${count} files.`);
