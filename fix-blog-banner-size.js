/**
 * fix-blog-banner-size.js
 * Updates blog banner dimensions to 851x315px in all HTML files
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

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

function fixBannerSize(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if no banner
    if (!content.includes('blog-banner-neon.jpg')) {
        return 'no-banner';
    }

    // Old style pattern - replace with fixed dimensions
    const oldPattern = /<img src="\.\/assets\/blog-banner-neon\.jpg"[^>]*style="[^"]*"[^>]*\/>/gi;

    // New optimized img tag with fixed dimensions
    const newImgTag = `<img src="./assets/blog-banner-neon.jpg" alt="Gizli Kutu Blog" loading="lazy" 
             width="851" height="315" 
             style="max-width:100%;width:851px;height:auto;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);" />`;

    if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newImgTag);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${fileName}`);
        return 'fixed';
    }

    console.log(`⚠️  Pattern not found but has banner: ${fileName}`);
    return 'no-match';
}

console.log('🚀 Fixing blog banner size to 851x315px...\n');

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
let fixed = 0, noBanner = 0, noMatch = 0;

for (const file of htmlFiles) {
    const result = fixBannerSize(file);
    if (result === 'fixed') fixed++;
    else if (result === 'no-banner') noBanner++;
    else if (result === 'no-match') noMatch++;
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Summary:`);
console.log(`   ✅ Fixed: ${fixed}`);
console.log(`   ⏭️  No banner: ${noBanner}`);
console.log(`   ⚠️  No match: ${noMatch}`);
console.log('='.repeat(50));
