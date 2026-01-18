/**
 * remove-inline-age-gate.js
 * Script to remove inline age-gate HTML and related JS from all HTML files
 * Keeps only the age-gate.js implementation (white popup)
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

function removeInlineAgeGate(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Remove the inline HTML age-gate overlay div
    // Pattern: <!-- +18 Yaş Doğrulama --> ... </div> for ageGateOverlay
    const htmlPattern = /<!-- \+18 Yaş Doğrulama -->\s*<div class="age-gate-overlay" id="ageGateOverlay">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;
    if (content.match(htmlPattern)) {
        content = content.replace(htmlPattern, '');
        modified = true;
        console.log(`🔧 Removed inline HTML age-gate: ${fileName}`);
    }

    // 2. Remove the inline JS for confirmAge and denyAge functions
    // Pattern: // Age Gate ... if (sessionStorage.getItem('ageVerified') === 'true') { ...
    const jsPattern = /\/\/ Age Gate\s*\n\s*function confirmAge\(\)[^}]+\}\s*\n\s*function denyAge\(\)[^}]+\}\s*\n\s*if \(sessionStorage\.getItem\('ageVerified'\)[^}]+\}/gi;
    if (content.match(jsPattern)) {
        content = content.replace(jsPattern, '');
        modified = true;
        console.log(`🔧 Removed inline JS age-gate: ${fileName}`);
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return 'fixed';
    }

    return 'unchanged';
}

console.log('🚀 Removing inline age-gate from all HTML files...\n');

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
let fixed = 0, unchanged = 0;

for (const file of htmlFiles) {
    const result = removeInlineAgeGate(file);
    if (result === 'fixed') fixed++;
    else unchanged++;
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Summary:`);
console.log(`   🔧 Fixed: ${fixed}`);
console.log(`   ✅ Unchanged: ${unchanged}`);
console.log('='.repeat(50));
