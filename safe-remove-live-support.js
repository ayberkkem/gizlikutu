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
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Remove Script (Safer Regex)
    // Matches the IIFE script containing the specific phone string and getElementById for liveSupport
    const scriptRegex = /<script>\s*\(function\s*\(\)\s*\{[\s\S]{0,200}const\s+phone\s*=\s*"905400443445";[\s\S]*?document\.getElementById\("liveSupport"\)[\s\S]*?\}\)\(\);\s*<\/script>/g;
    content = content.replace(scriptRegex, '');

    // 2. Remove "Canlı Destek" Widget HTML
    content = content.replace(/<!--\s*💬 Canlı Destek\s*-->/g, '');

    // Remove live-support div block matching unique inner content
    const htmlWidgetRegex = /<div class="live-support" id="liveSupport">[\s\S]*?WhatsApp'tan Gönder<\/button>\s*<\/div>\s*<\/div>/g;
    content = content.replace(htmlWidgetRegex, '');

    // 3. Remove Mini Icon HTML
    const htmlMiniRegex = /<div class="live-support-mini" id="liveSupportMini"[\s\S]*?<\/svg>\s*<\/div>/g;
    content = content.replace(htmlMiniRegex, '');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Cleaned Live Support from: ${path.basename(file)}`);
        count++;
    }
});

console.log(`Total files cleaned: ${count}`);
