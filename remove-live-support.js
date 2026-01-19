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

    // 1. Remove the "Live Support" Widget HTML
    // Matches the div starting with class/id, containing the button text, and closing divs
    content = content.replace(/<div class="live-support" id="liveSupport">[\s\S]*?WhatsApp'tan Gönder<\/button>\s*<\/div>\s*<\/div>/g, '');

    // 2. Remove the "Live Support Mini" Icon HTML
    content = content.replace(/<div class="live-support-mini" id="liveSupportMini"[\s\S]*?<\/svg>\s*<\/div>/g, '');

    // 3. Remove the generic "Canlı Destek" comment if it exists left over
    content = content.replace(/<!-- 💬 Canlı Destek -->/g, '');

    // 4. Remove the Script associated with it
    // Matches script tag containing the specific element ID lookup
    content = content.replace(/<script>[\s\S]*?document\.getElementById\("liveSupport"\)[\s\S]*?<\/script>/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Cleaned Live Support from: ${path.basename(file)}`);
        count++;
    }
});

console.log(`Total files cleaned: ${count}`);
