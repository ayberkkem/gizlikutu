const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const files = getAllFiles(publicDir).filter(f => f.endsWith('.html'));

// Default WhatsApp (Eğer sayfada yoksa bunu kullan)
const defaultWaHtml = `
            <a href="https://wa.me/905400443445" target="_blank" class="iconbtn" aria-label="WhatsApp" style="color:#25D366; background: rgba(37, 211, 102, 0.1);">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.248-.57-.397m-5.474 7.622h-13c-2.454 0-4.664-1.298-5.836-3.414-.265-.48-.396-1.002-.396-1.558v-4.017c0-1.92 1.564-3.483 3.483-3.483h2.155c.421 0 .809-.239 1.004-.616.195-.378.181-.83-.037-1.192l-1.03-1.706c-.477-.79-.404-1.802.193-2.528.598-.726 1.55-1.013 2.435-.733l1.834.58c.381.121.796.012 1.082-.284l1.373-1.425c.677-.702 1.666-.967 2.605-.698.94.27 1.63 1.077 1.815 2.073l.255 1.378c.075.405.378.718.77.795l1.603.315c1.026.202 1.814 1.017 2.016 2.08.204 1.064-.289 2.115-1.229 2.608l-1.206.633c-.352.185-.544.577-.487.969l.182 1.261c.148 1.028.932 1.848 1.996 2.062.261.053.522.079.782.079.805 0 1.569-.474 1.896-1.24l.659-1.543c.338-.79 1.155-1.229 2.012-1.087.857.142 1.551.782 1.714 1.637l.386 2.029c.176.924-.267 1.847-1.082 2.379-.623.407-.996 1.107-.996 1.854v.105c0 1.821-1.482 3.303-3.303 3.303"></path>
                </svg>
            </a>
`;

let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Header Bloğunu Yakala
    const headerRegex = /<header.*?>([\s\S]*?)<\/header>/i;
    const match = content.match(headerRegex);

    if (match) {
        const fullHeader = match[0];
        // Sadece content kısmında regex arayacağız ama replace tüm header'ı yapacak.

        // 1. Bileşenleri Extract Et
        const sidebarBtnRegex = /<button.*?onclick="toggleSidebar\(\)".*?>.*?<\/button>/s;
        const logoRegex = /<a class="logo".*?>.*?<\/a>/s;
        const existingWaRegex = /<a.*?href=".*?wa\.me.*?".*?>.*?<\/a>/s;
        const searchToggleRegex = /<button.*?class="iconbtn searchToggleBtn".*?>.*?<\/button>/s;
        const searchBoxRegex = /<div class="search".*?>.*?<\/div>/s;
        const navRegex = /<nav class="desktop-header-nav".*?>.*?<\/nav>/s;
        const cartRegex = /<a class="iconbtn cartWrap".*?>.*?<\/a>/s;

        let sidebarBtn = (fullHeader.match(sidebarBtnRegex) || [''])[0];
        let logo = (fullHeader.match(logoRegex) || [''])[0];
        let waBtn = (fullHeader.match(existingWaRegex) || [defaultWaHtml])[0];
        let searchToggle = (fullHeader.match(searchToggleRegex) || [''])[0];
        let searchBox = (fullHeader.match(searchBoxRegex) || [''])[0];
        let nav = (fullHeader.match(navRegex) || [''])[0];
        let cart = (fullHeader.match(cartRegex) || [''])[0];

        // Search Box Style güncelle (Flex yap ki yayılsın)
        if (searchBox) {
            // Eski style'ı temizleyip yenisini ekleyelim veya append edelim
            // Basitçe replace yapıyorum
            if (!searchBox.includes('flex:1')) {
                searchBox = searchBox.replace('class="search"', 'class="search" style="flex:1; max-width:600px; margin:0 1.5rem;"');
            }
        }

        // WhatsApp Style güncelle (Margin ekle)
        // waBtn = waBtn.replace('class="iconbtn"', 'class="iconbtn" style="margin-left:0.5rem;"'); // Basit styling

        // 2. Yeni Header Yapısını Oluştur
        // Not: header-right DIV'ini tamamen kaldırdık. Doğrudan header-row içine diziyoruz.

        const newHeader = `
  <header id="mainHeader">
    <div class="container">
      <div class="header-row" style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 0;">
        ${sidebarBtn}
        ${logo}
        ${waBtn}
        ${searchToggle}
        ${searchBox}
        ${nav}
        ${cart}
      </div>
    </div>
  </header>`;

        // 3. Dosyayı Güncelle
        // Eski header'ı yenisiyle değiştir
        const newContent = content.replace(fullHeader, newHeader);

        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Fixed header in: ${path.basename(file)}`);
            count++;
        }
    }
});

console.log(`Total headers fixed: ${count}`);
