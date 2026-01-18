/**
 * fix-blog-banner-seo.js
 * Updates blog banner with SEO-friendly text on sides
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
  const oldSectionPattern = /<!-- Blog Banner -->[\s\S]*?<\/section>/gi;

  // SEO-optimized banner with keywords
  const newBannerSection = `<!-- Blog Banner -->
    <style>
      @keyframes neonPulse {
        0%, 100% { box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff; }
        50% { box-shadow: 0 0 20px #ff66ff, 0 0 40px #ff66ff, 0 0 60px #ff66ff; filter: brightness(1.15); }
      }
      @keyframes textGlow {
        0%, 100% { text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff; opacity: 0.9; }
        50% { text-shadow: 0 0 15px #ff66ff, 0 0 30px #ff66ff; opacity: 1; }
      }
      .blog-banner-neon { animation: neonPulse 2s ease-in-out infinite; }
      .blog-banner-text { 
        animation: textGlow 2s ease-in-out infinite;
        font-family: Arial, sans-serif;
        font-weight: bold;
        color: #ff66ff;
        letter-spacing: 1px;
      }
    </style>
    <section class="blog-banner-section" style="width:100%;max-width:1100px;margin:30px auto;padding:0 15px;box-sizing:border-box;">
      <a href="./blog.html" title="Sex Shop Blog - Cinsel Sağlık Rehberi" style="display:block;text-decoration:none;">
        <div class="blog-banner-neon" style="
          position: relative;
          width: 100%;
          height: 180px;
          background: linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a 100%), 
                      url('./assets/blog-banner-neon.jpg') center center / contain no-repeat;
          background-color: #1a1a1a;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        ">
          <!-- Sol - SEO Keywords -->
          <div style="flex:0 0 22%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;">
            <span class="blog-banner-text" style="font-size:11px;margin-bottom:6px;">🔥 CİNSEL SAĞLIK</span>
            <span class="blog-banner-text" style="font-size:14px;margin-bottom:4px;">REHBERİ</span>
            <span class="blog-banner-text" style="font-size:10px;opacity:0.8;">Uzman Bilgileri</span>
          </div>
          <!-- Orta Boşluk -->
          <div style="flex:1;"></div>
          <!-- Sağ - CTA + SEO -->
          <div style="flex:0 0 22%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;">
            <span class="blog-banner-text" style="font-size:11px;margin-bottom:6px;">💡 ÜCRETSİZ</span>
            <span class="blog-banner-text" style="font-size:14px;margin-bottom:4px;">BİLGİ & İPUCU</span>
            <span class="blog-banner-text" style="font-size:12px;">TIKLA OKU ➜</span>
          </div>
        </div>
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

console.log('🚀 Updating banner with SEO-friendly text...\n');

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
