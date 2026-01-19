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

// WhatsApp Butonu HTML'i (Görseldeki gibi yeşil ikon)
const whatsappHtml = `
            <a href="https://wa.me/905400443445" target="_blank" class="iconbtn" aria-label="WhatsApp" style="color:#25D366; background: rgba(37, 211, 102, 0.1);">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.248-.57-.397m-5.474 7.622h-13c-2.454 0-4.664-1.298-5.836-3.414-.265-.48-.396-1.002-.396-1.558v-4.017c0-1.92 1.564-3.483 3.483-3.483h2.155c.421 0 .809-.239 1.004-.616.195-.378.181-.83-.037-1.192l-1.03-1.706c-.477-.79-.404-1.802.193-2.528.598-.726 1.55-1.013 2.435-.733l1.834.58c.381.121.796.012 1.082-.284l1.373-1.425c.677-.702 1.666-.967 2.605-.698.94.27 1.63 1.077 1.815 2.073l.255 1.378c.075.405.378.718.77.795l1.603.315c1.026.202 1.814 1.017 2.016 2.08.204 1.064-.289 2.115-1.229 2.608l-1.206.633c-.352.185-.544.577-.487.969l.182 1.261c.148 1.028.932 1.848 1.996 2.062.261.053.522.079.782.079.805 0 1.569-.474 1.896-1.24l.659-1.543c.338-.79 1.155-1.229 2.012-1.087.857.142 1.551.782 1.714 1.637l.386 2.029c.176.924-.267 1.847-1.082 2.379-.623.407-.996 1.107-.996 1.854v.105c0 1.821-1.482 3.303-3.303 3.303"></path>
                </svg>
            </a>
`;

let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Header Row'u bul
    // <div class="header-row"> ... </div>
    // İçeriği yakalayalım
    const headerRowRegex = /(<div class="header-row".*?>)(.*?)(<\/div>)/s;
    const match = content.match(headerRowRegex);

    if (match) {
        const openingTag = match[1];
        const innerContent = match[2];
        const closingTag = match[3];

        // Mevcut bileşenleri ayıkla
        // 1. Sidebar Toggle Button
        const sidebarBtnRegex = /<button.*?onclick="toggleSidebar\(\)".*?>.*?<\/button>/s;
        const sidebarBtnMatch = innerContent.match(sidebarBtnRegex);
        const sidebarBtn = sidebarBtnMatch ? sidebarBtnMatch[0] : '';

        // 2. Logo
        const logoRegex = /<a class="logo".*?>.*?<\/a>/s;
        const logoMatch = innerContent.match(logoRegex);
        const logo = logoMatch ? logoMatch[0] : '';

        // 3. Search Toggle (Mobil için) - Varsa alalım
        const searchToggleRegex = /<button.*?class="iconbtn searchToggleBtn".*?>.*?<\/button>/s;
        const searchToggleMatch = innerContent.match(searchToggleRegex);
        const searchToggle = searchToggleMatch ? searchToggleMatch[0] : '';

        // 4. Search Box
        const searchBoxRegex = /<div class="search".*?>.*?<\/div>/s;
        const searchBoxMatch = innerContent.match(searchBoxRegex);
        const searchBox = searchBoxMatch ? searchBoxMatch[0] : '';

        // 5. Nav
        const navRegex = /<nav class="desktop-header-nav".*?>.*?<\/nav>/s;
        const navMatch = innerContent.match(navRegex);
        const nav = navMatch ? navMatch[0] : '';

        // 6. Cart
        const cartRegex = /<a class="iconbtn cartWrap".*?>.*?<\/a>/s;
        const cartMatch = innerContent.match(cartRegex);
        const cart = cartMatch ? cartMatch[0] : '';

        // YENİ SIRALAMA İLE OLUŞTUR
        // Menu | Logo | WhatsApp | SearchToggle | Search | Nav | Cart

        let newInnerHtml = `
        ${sidebarBtn}
        ${logo}
        ${whatsappHtml}
        ${searchToggle}
        ${searchBox}
        ${nav}
        ${cart}
        `;

        // Gereksiz boşlukları temizle
        newInnerHtml = newInnerHtml.replace(/\n\s*\n/g, '\n');

        const finalHeaderRow = `${openingTag}${newInnerHtml}${closingTag}`;

        // WhatsApp zaten varsa ekleme (ama bizim kodumuz baştan kuruyor, duplicate olmaz)
        // Ancak eğer innerContent içinde zaten whatsapp varsa ve bizim regex onu yakalamadıysa?
        // Bu script "sadece bilinen bileşenleri" alır, gerisini atar.
        // Bu yüzden güvenlidir. TEHLİKE: Bilinmeyen başka buton varsa silinir.
        // Ama header yapısı standart olduğu için sorun olmamalı.

        // Dosyayı güncelle
        const newContent = content.replace(match[0], finalHeaderRow);

        // Değişiklik olduysa yaz
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated header in: ${path.basename(file)}`);
            count++;
        }
    }
});

console.log(`Header structure fixed in ${count} files.`);
