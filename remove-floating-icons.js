const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

let totalChanges = 0;

files.forEach(filename => {
    const filePath = path.join(publicDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Remove Floating WhatsApp Button (position:fixed with aria-label="WhatsApp Destek")
    const floatingWaRegex = /\s*<!-- Floating WhatsApp Button \(Centered Right\) -->\s*<a href="https:\/\/wa\.me\/905400443445" target="_blank" aria-label="WhatsApp Destek"[\s\S]*?<\/svg>\s*<\/a>/g;
    if (floatingWaRegex.test(content)) {
        content = content.replace(floatingWaRegex, '');
        changed = true;
    }

    // Remove PWA Install Icon script references
    if (content.includes('<script src="./js/pwa-install-icon.js"></script>')) {
        content = content.replace(/<script src="\.\/js\/pwa-install-icon\.js"><\/script>\s*/g, '');
        changed = true;
    }

    // Remove PWA Install Icon CSS reference
    if (content.includes('<link rel="stylesheet" href="./css/pwa-install-icon.css">')) {
        content = content.replace(/<link rel="stylesheet" href="\.\/css\/pwa-install-icon\.css">\s*/g, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalChanges++;
        console.log(`Fixed: ${filename}`);
    }
});

console.log(`\nTotal files modified: ${totalChanges}`);
