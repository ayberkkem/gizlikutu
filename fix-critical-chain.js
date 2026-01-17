const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // 1. Add defer to pwa-install-icon.js
        if (content.includes('<script src="./js/pwa-install-icon.js"></script>')) {
            content = content.replace(
                '<script src="./js/pwa-install-icon.js"></script>',
                '<script src="./js/pwa-install-icon.js" defer></script>'
            );
            changed = true;
        }

        // 2. Add defer to age-gate.js
        if (content.includes('<script src="./js/age-gate.js"></script>')) {
            content = content.replace(
                '<script src="./js/age-gate.js"></script>',
                '<script src="./js/age-gate.js" defer></script>'
            );
            changed = true;
        }

        // 3. Optimize inline categories fetch in index.html
        if (path.basename(filePath) === 'index.html') {
            const inlineScriptStart = '(async function () {';
            const inlineScriptReplacement = "window.addEventListener('load', async function () {";

            // We look for the specific script block that fetches categories
            if (content.includes('fetch("./data/categories.json"') && content.includes(inlineScriptStart)) {
                // This is a bit risky with string replacement if there are other async IIFEs.
                // Let's be more specific with context.
                const targetBlock = `    (async function () {
      try {
        const res = await fetch("./data/categories.json", { cache: "no-store" });`;

                const replacementBlock = `    window.addEventListener('load', async function () {
      try {
        const res = await fetch("./data/categories.json", { cache: "public, max-age=3600" });`;
                // Also changing cache key to default/public to use our new cache strategy if possible, or keep no-store if logic demands it.
                // User didn't ask to change cache policy for this, but 'no-store' is bad for perf. 
                // However, let's stick to just deferring execution first to be safe logic-wise.

                const safeTarget = `(async function () {
      try {
        const res = await fetch("./data/categories.json"`;

                const safeReplacement = `window.addEventListener('load', async function () {
      try {
        const res = await fetch("./data/categories.json"`;

                if (content.includes(safeTarget)) {
                    content = content.replace(safeTarget, safeReplacement);
                    changed = true;
                }
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
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
        } else if (file.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

console.log('Starting Critical Chain fixes...');
traverseDir(publicDir);
console.log('Complete.');
