const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'index.html');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const target = '<link rel="stylesheet" href="./css/main.css">';
    const preloadLink = `
  <!-- LCP Optimization: Preload critical background image -->
  <link rel="preload" fetchpriority="high" as="image" href="./assets/backgrounds/premium-bg.webp" type="image/webp">
  <link rel="stylesheet" href="./css/main.css">`;

    if (content.includes(target) && !content.includes('premium-bg.webp" type="image/webp"')) {
        const newContent = content.replace(target, preloadLink.trim());
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Successfully added preload link to index.html');
    } else {
        console.log('Target not found or preload already exists.');
    }

} catch (err) {
    console.error('Error:', err);
}
