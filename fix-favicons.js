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

// Eklenecek Standart Favicon Bloğu
const faviconBlock = `
  <link rel="icon" href="./assets/logo.jpg" type="image/jpeg">
  <link rel="apple-touch-icon" href="./assets/logo.jpg">
  <link rel="shortcut icon" href="./assets/logo.jpg" type="image/jpeg">
`;

let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Mevcut icon tanımlarını temizle (Regex ile)
    // <link rel="icon"...>, <link rel="shortcut icon"...>, <link rel="apple-touch-icon"...>
    content = content.replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, '');
    content = content.replace(/<link[^>]*rel=["']shortcut icon["'][^>]*>/gi, '');
    content = content.replace(/<link[^>]*rel=["']apple-touch-icon["'][^>]*>/gi, '');

    // Temizlikten sonra boş satırlar kalmış olabilir, sorun değil.

    // 2. Yeni bloğu <head> kapanışından hemen önce veya <head> açılışından sonra ekle.
    // <meta charset> varsa ondan sonraya eklemek iyidir. Yoksa head taginden sonraya.

    if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>${faviconBlock}`);
    } else if (content.includes('<meta charset="utf-8" />')) {
        content = content.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />${faviconBlock}`);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
    }
});

console.log(`Favicons updated in ${count} files.`);
