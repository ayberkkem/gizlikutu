const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if it's an HTML file
        if (!filePath.endsWith('.html')) return;

        const target = '<link rel="stylesheet" href="./css/main.css">';
        const targetAlternative = '<link rel="stylesheet" href="../css/main.css">'; // For subdirectories if any, though structure seems flat-ish or relative

        // We need to handle relative paths correctly.
        // In index.html (root), it is ./assets/...
        // In subfiles, it might be ../assets/...
        // But wait, most files in public seem to be flat or having <base>?
        // Let's look at the existing link.

        // If the file contains './css/main.css', it likely uses './assets'
        // If it uses '../css/main.css', it likely uses '../assets'

        let linkToInsert = '';
        let targetStr = '';

        if (content.includes(target)) {
            targetStr = target;
            linkToInsert = `
  <!-- LCP Optimization: Preload critical background image -->
  <link rel="preload" fetchpriority="high" as="image" href="./assets/backgrounds/premium-bg.webp" type="image/webp">
  <link rel="stylesheet" href="./css/main.css">`;
        } else if (content.includes('<link rel="stylesheet" href="../css/main.css">')) {
            targetStr = '<link rel="stylesheet" href="../css/main.css">';
            linkToInsert = `
  <!-- LCP Optimization: Preload critical background image -->
  <link rel="preload" fetchpriority="high" as="image" href="../assets/backgrounds/premium-bg.webp" type="image/webp">
  <link rel="stylesheet" href="../css/main.css">`;
        }

        if (linkToInsert && !content.includes('premium-bg.webp" type="image/webp"')) {
            const newContent = content.replace(targetStr, linkToInsert.trim());
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${path.basename(filePath)}`);
        }

    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

console.log('Starting LCP preload injection...');
traverseDir(publicDir);
console.log('Complete.');
