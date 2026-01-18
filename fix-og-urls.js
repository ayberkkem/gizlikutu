/**
 * Script to fix og:url meta tags - ensure they match actual filenames
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const BASE_URL = 'https://gizlikutu.online';

function getHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && item.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

function fixOgUrl(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    let correctUrl;
    if (fileName === 'index.html') {
        correctUrl = `${BASE_URL}/`;
    } else {
        correctUrl = `${BASE_URL}/${fileName}`;
    }

    // Fix og:url
    const ogUrlRegex = /<meta\s+property="og:url"\s+content="([^"]+)"\s*\/?>/gi;
    const match = content.match(ogUrlRegex);

    if (!match) {
        return { status: 'no-og-url', file: fileName };
    }

    const newContent = content.replace(ogUrlRegex, `<meta property="og:url" content="${correctUrl}">`);

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`🔧 Fixed og:url: ${fileName}`);
        return { status: 'fixed', file: fileName };
    }

    console.log(`✅ Already correct: ${fileName}`);
    return { status: 'correct', file: fileName };
}

console.log('🚀 Fixing og:url meta tags...\n');

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
let fixed = 0, correct = 0, noOgUrl = 0;

for (const file of htmlFiles) {
    const result = fixOgUrl(file);
    if (result.status === 'fixed') fixed++;
    else if (result.status === 'correct') correct++;
    else if (result.status === 'no-og-url') noOgUrl++;
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Summary:`);
console.log(`   🔧 Fixed: ${fixed}`);
console.log(`   ✅ Already correct: ${correct}`);
console.log(`   ⏭️  No og:url: ${noOgUrl}`);
console.log('='.repeat(50));
