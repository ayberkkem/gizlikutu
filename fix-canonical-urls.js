/**
 * Script to fix canonical URLs - ensure they match actual filenames
 * Problem: Canonical URLs have Turkish characters but actual filenames use ASCII
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const BASE_URL = 'https://gizlikutu.online';

// Get all HTML files
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

// Fix canonical URL in HTML file
function fixCanonicalUrl(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine correct canonical URL (based on ACTUAL filename)
    let correctCanonicalUrl;
    if (fileName === 'index.html') {
        correctCanonicalUrl = `${BASE_URL}/`;
    } else {
        correctCanonicalUrl = `${BASE_URL}/${fileName}`;
    }

    // Find and fix canonical tag
    const canonicalRegex = /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/gi;
    const match = content.match(canonicalRegex);

    if (!match) {
        console.log(`⏭️  No canonical found: ${fileName}`);
        return { status: 'no-canonical', file: fileName };
    }

    // Extract current canonical URL
    const currentMatch = /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/i.exec(content);
    const currentUrl = currentMatch ? currentMatch[1] : '';

    // Check if it needs fixing
    if (currentUrl === correctCanonicalUrl) {
        console.log(`✅ Already correct: ${fileName}`);
        return { status: 'correct', file: fileName };
    }

    // Fix the canonical URL
    const newContent = content.replace(canonicalRegex, `<link rel="canonical" href="${correctCanonicalUrl}">`);

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`🔧 Fixed: ${fileName}`);
        console.log(`   Old: ${currentUrl}`);
        console.log(`   New: ${correctCanonicalUrl}`);
        return { status: 'fixed', file: fileName, old: currentUrl, new: correctCanonicalUrl };
    }

    return { status: 'unchanged', file: fileName };
}

// Main
console.log('🚀 Fixing canonical URLs...\n');
console.log(`📁 Directory: ${PUBLIC_DIR}`);
console.log(`🌐 Base URL: ${BASE_URL}\n`);

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

let fixed = 0;
let correct = 0;
let noCanonical = 0;

for (const file of htmlFiles) {
    const result = fixCanonicalUrl(file);
    if (result.status === 'fixed') fixed++;
    else if (result.status === 'correct') correct++;
    else if (result.status === 'no-canonical') noCanonical++;
}

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log(`   🔧 Fixed: ${fixed}`);
console.log(`   ✅ Already correct: ${correct}`);
console.log(`   ⏭️  No canonical: ${noCanonical}`);
console.log('='.repeat(60));
console.log('\n🎉 Done! Commit, deploy, then re-validate in Google Search Console.');
