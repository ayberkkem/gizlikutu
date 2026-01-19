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

    // Zaten ekli mi?
    if (!content.includes('cargo-timer.js')) {
        // En son scriptlerin altına ekleyelim
        // </body> öncesi en güvenli yerdir
        if (content.includes('</body>')) {
            content = content.replace('</body>', '  <!-- Cargo Countdown Timer -->\n  <script src="./js/cargo-timer.js"></script>\n</body>');
            fs.writeFileSync(file, content, 'utf8');
            count++;
        }
    }
});

console.log(`Cargo Timer script injected into ${count} files.`);
