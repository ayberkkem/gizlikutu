/**
 * Bu script tüm HTML dosyalarından:
 * 1. Header'daki Hakkımızda ve İletişim linklerini kaldırır
 * 2. Hamburger menü (drawer) çalışmasını düzeltir
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');

// Tüm HTML dosyalarını bul
function getAllHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllHtmlFiles(fullPath, files);
        } else if (entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const fileName = path.basename(filePath);

    // 1. Desktop Header Nav'dan Hakkımızda ve İletişim linklerini kaldır
    // <nav class="desktop-header-nav"> içindeki about.html ve contact.html linklerini kaldır
    const desktopNavPatterns = [
        /<a[^>]*href="[^"]*about[^"]*"[^>]*>Hakkımızda<\/a>/gi,
        /<a[^>]*href="[^"]*contact[^"]*"[^>]*>İletişim<\/a>/gi,
        /<a[^>]*href="\.\/about\.html"[^>]*>[^<]*<\/a>/gi,
        /<a[^>]*href="\.\/contact\.html"[^>]*>[^<]*<\/a>/gi,
    ];

    for (const pattern of desktopNavPatterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }

    // 2. Mobile top nav'dan da kaldır
    const mobileNavPatterns = [
        /<a[^>]*href="[^"]*about[^"]*"[^>]*>\s*(Hakkımızda|About)\s*<\/a>/gi,
        /<a[^>]*href="[^"]*contact[^"]*"[^>]*>\s*(İletişim|Contact)\s*<\/a>/gi,
    ];

    for (const pattern of mobileNavPatterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }

    // 3. Drawer/Hamburger menüden de Hakkımızda ve İletişim linklerini kaldır
    const drawerPatterns = [
        /<a[^>]*class="navlink"[^>]*href="[^"]*about[^"]*"[^>]*data-close-drawer[^>]*>[^<]*<\/a>/gi,
        /<a[^>]*class="navlink"[^>]*data-close-drawer[^>]*href="[^"]*about[^"]*"[^>]*>[^<]*<\/a>/gi,
        /<a[^>]*class="navlink"[^>]*href="[^"]*contact[^"]*"[^>]*data-close-drawer[^>]*>[^<]*<\/a>/gi,
        /<a[^>]*class="navlink"[^>]*data-close-drawer[^>]*href="[^"]*contact[^"]*"[^>]*>[^<]*<\/a>/gi,
    ];

    for (const pattern of drawerPatterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }

    // 4. toggleSidebar fonksiyonunun inline tanımını ekle (eğer yoksa)
    // Hamburger menü sorununu çözmek için script'i başa ekle
    const toggleSidebarScript = `
<script>
// Hamburger menü toggle fonksiyonu - inline tanım
window.toggleSidebar = function() {
    var d = document.getElementById("drawer");
    var b = document.getElementById("drawerBackdrop");
    if (d && b) {
        d.classList.toggle("open");
        b.classList.toggle("open");
    }
};
// Backdrop tıklamasıyla kapat
document.addEventListener("DOMContentLoaded", function() {
    var backdrop = document.getElementById("drawerBackdrop");
    var closeBtn = document.getElementById("closeDrawer");
    if (backdrop) {
        backdrop.addEventListener("click", function() {
            var d = document.getElementById("drawer");
            var b = document.getElementById("drawerBackdrop");
            if (d && b) { d.classList.remove("open"); b.classList.remove("open"); }
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            var d = document.getElementById("drawer");
            var b = document.getElementById("drawerBackdrop");
            if (d && b) { d.classList.remove("open"); b.classList.remove("open"); }
        });
    }
});
</script>
`;

    // Eğer toggleSidebar inline script yoksa ekle (body tag'inden hemen sonra)
    if (!content.includes('window.toggleSidebar = function()') && 
        !content.includes('window.toggleSidebar=function')) {
        // <body> taginden sonra ekle
        if (content.includes('<body>') || content.includes('<body ')) {
            const bodyMatch = content.match(/<body[^>]*>/i);
            if (bodyMatch) {
                content = content.replace(bodyMatch[0], bodyMatch[0] + toggleSidebarScript);
                modified = true;
            }
        }
    }

    // 5. CSS ile hide eden satırları da kaldıralım veya güncelleyelim
    // Zaten CSS ile gizleniyor ama HTML'den tamamen kaldırmak daha temiz

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Güncellendi: ${fileName}`);
        return true;
    } else {
        console.log(`⏭️  Değişiklik yok: ${fileName}`);
        return false;
    }
}

// Ana işlem
console.log('🔧 Header düzeltme scripti başlatılıyor...\n');

const htmlFiles = getAllHtmlFiles(PUBLIC_DIR);
console.log(`📁 Toplam ${htmlFiles.length} HTML dosyası bulundu.\n`);

let modifiedCount = 0;
for (const file of htmlFiles) {
    try {
        if (processFile(file)) {
            modifiedCount++;
        }
    } catch (err) {
        console.error(`❌ Hata: ${path.basename(file)} - ${err.message}`);
    }
}

console.log(`\n✅ İşlem tamamlandı. ${modifiedCount} dosya güncellendi.`);
