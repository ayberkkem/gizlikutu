/**
 * fix-blog-banner-final.js
 * Updates blog banner - taller height + LED neon glow animation
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

  // New banner with taller height (250px) and LED neon animation
  const newBannerSection = `<!-- Blog Banner -->
    <style>
      @keyframes neonPulse {
        0%, 100% { 
          box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #ff00ff;
          filter: brightness(1);
        }
        50% { 
          box-shadow: 0 0 20px #ff66ff, 0 0 40px #ff66ff, 0 0 60px #ff66ff, 0 0 80px #ff66ff;
          filter: brightness(1.2);
        }
      }
      .blog-banner-neon {
        animation: neonPulse 2s ease-in-out infinite;
      }
    </style>
    <section class="blog-banner-section" style="
      width: 100%;
      max-width: 900px;
      margin: 30px auto;
      padding: 0 15px;
      box-sizing: border-box;
    ">
      <a href="./blog.html" title="Blog'a Git" style="display:block;">
        <div class="blog-banner-neon" style="
          width: 100%;
          height: 250px;
          background: url('./assets/blog-banner-neon.jpg') center center / contain no-repeat;
          background-color: #1a1a1a;
          border-radius: 16px;
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

console.log('🚀 Updating banner: taller height + LED neon animation...\n');

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
