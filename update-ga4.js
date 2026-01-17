const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const newGaId = 'G-4P97710X3C';
const oldGaId = 'G-6FSVNXZPN9'; // The one we might have just added

const newGaCode = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${newGaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', '${newGaId}');
  </script>`;

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Remove the old GA code if present
        if (content.includes(oldGaId)) {
            // We can use a regex or string replacement. 
            // Since we know exactly what we inserted (mostly), let's try to replace the block.
            // Or simpler: replace the ID in the existing block if the structure matches.

            // Let's first try to just replace the ID if the block structure is identical to what we want.
            content = content.replace(new RegExp(oldGaId, 'g'), newGaId);
            modified = true;
        }
        // 2. If old code wasn't found but we need to add new code (and it's not already there)
        else if (!content.includes(newGaId)) {
            if (content.includes('</head>')) {
                content = content.replace('</head>', `${newGaCode}\n</head>`);
                modified = true;
            }
        }

        if (modified) {
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

console.log('Replacing GA4 ID...');
traverseDir(publicDir);
console.log('Complete.');
