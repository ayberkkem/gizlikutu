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

const allFiles = getAllFiles(publicDir);
let fixedCount = 0;

// Sadece TAM KELİME kalıplarını hedefleyen güvenli liste.
// Regex'ler HTML taglerini bozmayacak şekilde seçildi.
const replacements = [
    // Kelime Bazlı Güvenli Düzeltmeler (Hem ? hem  hem de eksik harf varyasyonları)
    { pattern: /G[\?\ufffd]venli/g, replacement: 'Güvenli' },
    { pattern: /Gvenli/g, replacement: 'Güvenli' },

    { pattern: /[\?\ufffd]deme/g, replacement: 'Ödeme' },
    { pattern: /\bdeme/g, replacement: 'Ödeme' }, // Kelime başı kontrolü

    { pattern: /H[\?\ufffd]zl[\?\ufffd]/g, replacement: 'Hızlı' },
    { pattern: /Hzl/g, replacement: 'Hızlı' },

    { pattern: /[\?\ufffd]r[\?\ufffd]nler/g, replacement: 'Ürünler' },
    { pattern: /rnler/g, replacement: 'Ürünler' },
    { pattern: /[\?\ufffd]r[\?\ufffd]n/g, replacement: 'Ürün' },
    { pattern: /\brn\b/g, replacement: 'Ürün' },

    { pattern: /[\?\ufffd]leti[\?\ufffd]im/g, replacement: 'İletişim' },
    { pattern: /letiim/g, replacement: 'İletişim' },

    { pattern: /Hakk[\?\ufffd]m[\?\ufffd]zda/g, replacement: 'Hakkımızda' },
    { pattern: /Hakkmzda/g, replacement: 'Hakkımızda' },

    { pattern: /S[\?\ufffd]zle[\?\ufffd]meler/g, replacement: 'Sözleşmeler' },
    { pattern: /Szlemeler/g, replacement: 'Sözleşmeler' },

    { pattern: /Sipari[\?\ufffd]/g, replacement: 'Sipariş' },
    { pattern: /Sipari/g, replacement: 'Sipariş' },

    { pattern: /[\?\ufffd]ade/g, replacement: 'İade' },
    { pattern: /\bade\b/g, replacement: 'İade' }, // Sadece tam kelime "ade" ise

    { pattern: /Kap[\?\ufffd]da/g, replacement: 'Kapıda' },
    { pattern: /Kapda/g, replacement: 'Kapıda' },

    { pattern: /Ma[\?\ufffd]aza/g, replacement: 'Mağaza' },
    { pattern: /Maaza/g, replacement: 'Mağaza' },

    { pattern: /Al[\?\ufffd]veri[\?\ufffd]/g, replacement: 'Alışveriş' },
    { pattern: /Alveri/g, replacement: 'Alışveriş' },

    { pattern: /Ke[\?\ufffd]fet/g, replacement: 'Keşfet' },
    { pattern: /Kefet/g, replacement: 'Keşfet' },

    { pattern: /Ba[\?\ufffd]la/g, replacement: 'Başla' },
    { pattern: /Bala/g, replacement: 'Başla' },

    // Şehirler
    { pattern: /AKH[\?\ufffd]SAR/g, replacement: 'AKHİSAR' },
    { pattern: /AKHSAR/g, replacement: 'AKHİSAR' },

    // Copyright
    { pattern: /[\?\ufffd]\s*2026/g, replacement: '© 2026' },
];

console.log("Starting SAFE Encoding Fix...");

allFiles.forEach(filePath => {
    const ext = path.extname(filePath).toLowerCase();
    // Sadece HTML ve JS dosyaları. JSON, CSS dokunmuyoruz (risk azaltmak için).
    if (!['.html', '.js'].includes(ext)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        replacements.forEach(rep => {
            content = content.replace(rep.pattern, rep.replacement);
        });

        // Tekil  karakteri temizliği (Sadece gerçekten bozuk karakter varsa)
        // DİKKAT: ? işaretini silmiyoruz çünkü URL'lerde lazım. Sadece  siliyoruz.
        content = content.replace(/\uFFFD/g, '');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${path.basename(filePath)}`);
            fixedCount++;
        }
    } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
    }
});

console.log(`Total fixed files: ${fixedCount}`);
