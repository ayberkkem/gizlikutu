const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const correctGaId = 'G-6FSVNXZPN9'; // The original one you shared last
const wrongGaId = 'G-4P97710X3C'; // The one we updated to (based on your screenshot showing 6FS...)

// Wait, looking at the latest screenshot (uploaded_image_1768680408394.png)
// It clearly shows: ÖLÇÜM KİMLİĞİ G-6FSVNXZPN9
// But in the previous turn, you sent G-4P97710X3C and said "doğrusu bu bunu kullan"
// And now you say "tüm kontrolleri yap ve doğru gir" with the screenshot showing G-6FSVNXZPN9 again.
// Okay, the screenshot is the source of truth. The user is correcting themselves again.
// Screenshot ID: G-6FSVNXZPN9

const finalGaId = 'G-6FSVNXZPN9';
const currentWrongOne = 'G-4P97710X3C';

const correctGaCode = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${finalGaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', '${finalGaId}');
  </script>`;

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace the wrong one if present
        if (content.includes(currentWrongOne)) {
            content = content.replace(new RegExp(currentWrongOne, 'g'), finalGaId);
            modified = true;
        }

        // Also check if somehow we missed inserting it at all, or if the old logic failed
        if (!content.includes(finalGaId) && content.includes('</head>')) {
            // If it's missing entirely (e.g. we didn't add it yet)
            content = content.replace('</head>', `${correctGaCode}\n</head>`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${path.basename(filePath)}`);
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

console.log(`Reverting GA4 ID to ${finalGaId}...`);
traverseDir(publicDir);
console.log('Complete.');
