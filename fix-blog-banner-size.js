/**
 * fix-blog-banner-youtube-style.js
 * Updates blog banner to YouTube channel banner style - full width
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

function fixBannerStyle(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('blog-banner-neon.jpg')) {
        return 'no-banner';
    }

    // Match existing banner section
    const oldSectionPattern = /<!-- Blog Banner -->[\s\S]*?<section class="blog-banner-section"[^>]*>[\s\S]*?<\/section>/gi;

    // New YouTube-style banner - full width, rounded corners, centered
    const newBannerSection = `<!-- Blog Banner -->
    <section class="blog-banner-section" style="
      width: 100%;
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 15px;
      box-sizing: border-box;
    ">
      <a href="./blog.html" title="Blog'a Git" style="display:block;">
        <div style="
          width: 100%;
          height: 150px;
          background: url('./assets/blog-banner-neon.jpg') center center / cover no-repeat;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        "></div>
      </a>
    </section>`;

    if (content.match(oldSectionPattern)) {
        content = content.replace(oldSectionPattern, newBannerSection);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${fileName}`);
        return 'fixed';
    }

    console.log(`⚠️  Pattern not found: ${fileName}`);
    return 'no-match';
}

console.log('🚀 Converting to YouTube-style full-width banner...\n');

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
let fixed = 0, noBanner = 0, noMatch = 0;

for (const file of htmlFiles) {
    const result = fixBannerStyle(file);
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
