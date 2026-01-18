/**
 * add-blog-banner-v2.js
 * Adds blog-banner-neon.jpg before footer or at the end of main content
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

function addBlogBanner(filePath) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has the banner
    if (content.includes('blog-banner-neon.jpg')) {
        console.log(`⏭️  Already has banner: ${fileName}`);
        return 'skipped';
    }

    // Skip 404 page
    if (fileName === '404.html') {
        console.log(`⏭️  Skipping 404 page: ${fileName}`);
        return 'skipped';
    }

    // Banner HTML
    const bannerHtml = `
    <!-- Blog Banner -->
    <section class="blog-banner-section" style="text-align:center;margin:30px auto;max-width:800px;padding:0 15px;">
      <a href="./blog.html" title="Blog'a Git">
        <img src="./assets/blog-banner-neon.jpg" alt="Gizli Kutu Blog" loading="lazy" 
             style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);" />
      </a>
    </section>

`;

    // Try different insertion points in order of priority

    // Priority 1: Before <!-- 5) WHATSAPP QR --> (index.html style)
    if (content.includes('<!-- 5) WHATSAPP QR -->')) {
        content = content.replace('<!-- 5) WHATSAPP QR -->', bannerHtml + '<!-- 5) WHATSAPP QR -->');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added (before WhatsApp QR): ${fileName}`);
        return 'added';
    }

    // Priority 2: Before <section class="qr-zone">
    if (content.includes('<section class="qr-zone">')) {
        content = content.replace('<section class="qr-zone">', bannerHtml + '<section class="qr-zone">');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added (before qr-zone): ${fileName}`);
        return 'added';
    }

    // Priority 3: Before <!-- Politika --> comment (city pages)
    if (content.includes('<!-- Politika -->')) {
        content = content.replace('<!-- Politika -->', bannerHtml + '<!-- Politika -->');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added (before Politika): ${fileName}`);
        return 'added';
    }

    // Priority 4: Before <div class="sectionTitle"> with Güven & Politika
    if (content.includes('<h3>Güven &amp; Politika</h3>') || content.includes('<h3>Güven & Politika</h3>')) {
        const pattern = /(<div class="sectionTitle">\s*<h3>Güven [&amp;|&] Politika<\/h3>)/gi;
        if (content.match(pattern)) {
            content = content.replace(pattern, bannerHtml + '$1');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Added (before Güven section): ${fileName}`);
            return 'added';
        }
    }

    // Priority 5: Before </main> tag
    if (content.includes('</main>')) {
        content = content.replace('</main>', bannerHtml + '</main>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added (before </main>): ${fileName}`);
        return 'added';
    }

    // Priority 6: Before <footer
    if (content.includes('<footer')) {
        content = content.replace(/<footer/i, bannerHtml + '<footer');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added (before footer): ${fileName}`);
        return 'added';
    }

    console.log(`⚠️  No suitable location: ${fileName}`);
    return 'no-match';
}

console.log('🚀 Adding blog banner to all HTML files (v2)...\n');

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
let added = 0, skipped = 0, noMatch = 0;

for (const file of htmlFiles) {
    const result = addBlogBanner(file);
    if (result === 'added') added++;
    else if (result === 'skipped') skipped++;
    else if (result === 'no-match') noMatch++;
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Summary:`);
console.log(`   ✅ Added: ${added}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ⚠️  No match: ${noMatch}`);
console.log('='.repeat(50));
