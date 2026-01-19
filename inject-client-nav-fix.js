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

    // Eğer daha önce eklenmemişse
    if (!content.includes('client-nav-fix.js')) {
        // Body kapanmadan hemen önceye ekle
        if (content.includes('</body>')) {
            content = content.replace('</body>', '  <!-- Force Navigation Clean -->\n  <script src="./js/client-nav-fix.js"></script>\n</body>');
            fs.writeFileSync(file, content, 'utf8');
            count++;
        }
    }
});

console.log(`Client Nav Fix injected into ${count} files.`);
