/**
 * fix-blog-banner-final.js
 * White text, larger font, centered position
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

  const oldSectionPattern = /<!-- Blog Banner -->[\s\S]*?<\/section>/gi;

  // Clean professional design - white text, centered, larger
  const newBannerSection = `<!-- Blog Banner -->
    <style>
      @keyframes neonPulse {
        0%, 100% { box-shadow: 0 0 15px #ff00ff, 0 0 30px #ff00ff; }
        50% { box-shadow: 0 0 25px #ff66ff, 0 0 50px #ff66ff; filter: brightness(1.1); }
      }
      @keyframes textGlow {
        0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
        50% { text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 30px #ff66ff; }
      }
      .blog-banner-neon { animation: neonPulse 2s ease-in-out infinite; }
      .blog-banner-text { 
        animation: textGlow 2s ease-in-out infinite;
        font-family: Arial, sans-serif;
        font-weight: bold;
        color: #ffffff;
        text-transform: uppercase;
      }
    </style>
    <section class="blog-banner-section" style="width:100%;max-width:1100px;margin:30px auto;padding:0 15px;box-sizing:border-box;">
      <a href="./blog.html" title="Sex Shop Blog - Cinsel Sağlık Rehberi" style="display:block;text-decoration:none;">
        <div class="blog-banner-neon" style="
          position: relative;
          width: 100%;
          height: 180px;
          background: url('./assets/blog-banner-neon.jpg') center center / contain no-repeat;
          background-color: #1a1a1a;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          overflow: hidden;
        ">
          <!-- Sol Metin - Daha ortada -->
          <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:15px 30px;background:rgba(0,0,0,0.6);border-radius:10px;">
            <span class="blog-banner-text" style="font-size:14px;margin-bottom:5px;">🔥 CİNSEL SAĞLIK</span>
            <span class="blog-banner-text" style="font-size:20px;letter-spacing:2px;">REHBERİ</span>
          </div>
          <!-- Orta Boşluk - Görsel için -->
          <div style="flex:0 0 300px;"></div>
          <!-- Sağ Metin - Daha ortada -->
          <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:15px 30px;background:rgba(0,0,0,0.6);border-radius:10px;">
            <span class="blog-banner-text" style="font-size:14px;margin-bottom:5px;">💡 ÜCRETSİZ İPUÇLARI</span>
            <span class="blog-banner-text" style="font-size:20px;letter-spacing:2px;">TIKLA OKU ➜</span>
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

console.log('🚀 Updating banner: white text, larger, centered...\n');

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
