/**
 * Script to add canonical URLs to all HTML files
 * This fixes the Google Search Console "User-selected canonical without page" issue
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const BASE_URL = 'https://gizlikutu.online';

// Get all HTML files in public directory
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

// Add canonical tag to HTML file
function addCanonicalTag(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has canonical tag
    if (content.includes('rel="canonical"') || content.includes("rel='canonical'")) {
        console.log(`⏭️  Skipped (already has canonical): ${fileName}`);
        return false;
    }

    // Determine canonical URL
    let canonicalUrl;
    if (fileName === 'index.html') {
        canonicalUrl = `${BASE_URL}/`;
    } else {
        canonicalUrl = `${BASE_URL}/${fileName}`;
    }

    // Create canonical tag
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;

    // Find the best place to insert (after <head> or after charset/viewport meta tags)
    let inserted = false;

    // Try to insert after existing meta tags for better organization
    const metaPatterns = [
        /(<meta\s+name="viewport"[^>]*>)/i,
        /(<meta\s+charset[^>]*>)/i,
        /(<head[^>]*>)/i
    ];

    for (const pattern of metaPatterns) {
        const match = content.match(pattern);
        if (match) {
            const insertPos = match.index + match[0].length;
            content = content.slice(0, insertPos) + '\n    ' + canonicalTag + content.slice(insertPos);
            inserted = true;
            break;
        }
    }

    if (!inserted) {
        console.log(`❌ Could not find insertion point: ${fileName}`);
        return false;
    }

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added canonical tag: ${fileName} → ${canonicalUrl}`);
    return true;
}

// Main execution
console.log('🚀 Starting canonical tag addition...\n');
console.log(`📁 Scanning: ${PUBLIC_DIR}`);
console.log(`🌐 Base URL: ${BASE_URL}\n`);

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

let added = 0;
let skipped = 0;
let failed = 0;

for (const file of htmlFiles) {
    const result = addCanonicalTag(file);
    if (result === true) added++;
    else if (result === false) skipped++;
    else failed++;
}

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`   ✅ Added: ${added}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Failed: ${failed}`);
console.log('='.repeat(50));
console.log('\n🎉 Done! Now commit and deploy to fix Google indexing.');
