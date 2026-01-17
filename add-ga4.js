const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const gaId = 'G-6FSVNXZPN9';

const gaCode = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', '${gaId}');
  </script>`;

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if file is HTML
        if (!filePath.endsWith('.html')) return;

        // Check if GA is already present
        if (content.includes(`gtag/js?id=${gaId}`)) {
            console.log(`Skipping ${path.basename(filePath)} (GA already present)`);
            return;
        }

        // Insert before </head>
        if (content.includes('</head>')) {
            const newContent = content.replace('</head>', `${gaCode}\n</head>`);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${path.basename(filePath)}`);
        } else {
            console.log(`Warning: No </head> found in ${path.basename(filePath)}`);
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

console.log('Starting GA4 Injection...');
traverseDir(publicDir);
console.log('Complete.');
