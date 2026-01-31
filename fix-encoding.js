/**
 * Türkçe Encoding Hatalarını Düzelt
 * Tüm kategori sayfalarındaki bozuk karakterleri düzeltir
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Düzeltilecek dosyalar
const files = [
    'vibrator.html',
    'dildo.html',
    'manken.html',
    'titresim.html',
    'realistik.html'
];

// Karakter değiştirme haritası (Bozuk → Doğru)
const replacements = [
    // Türkçe harfler
    ['Ã¼', 'ü'],
    ['Ãœ', 'Ü'],
    ['Ã¶', 'ö'],
    ['Ã–', 'Ö'],
    ['ÅŸ', 'ş'],
    ['Åž', 'Ş'],
    ['ÄŸ', 'ğ'],
    ['Äž', 'Ğ'],
    ['Ä±', 'ı'],
    ['Ä°', 'İ'],
    ['Ã§', 'ç'],
    ['Ã‡', 'Ç'],
    ['SAÄ', 'SAĞ'],

    // Özel karakterler
    ['â€"', '–'],
    ['â†'', '↑'],
    ['â†"', '↓'],
        ['â€™', "'"],
        ['â€œ', '"'],
        ['â€', '"'],

        // Yaygın bozuk kombinasyonlar
        ['Ã¼rÃ¼n', 'ürün'],
        ['ÃœrÃ¼n', 'Ürün'],
        ['TÃ¼mÃ¼', 'Tümü'],
        ['PopÃ¼ler', 'Popüler'],
        ['SÄ±ralama', 'Sıralama'],
        ['SÄ±fÄ±rla', 'Sıfırla'],
        ['VibratÃ¶r', 'Vibratör'],
        ['KullanÄ±m', 'Kullanım'],
        ['Ã‡eÅŸitleri', 'Çeşitleri'],
        ['baÅŸÄ±na', 'başına'],
        ['iliÅŸkilerde', 'ilişkilerde'],
        ['zenginleÅŸtiren', 'zenginleştiren'],
        ['oyuncaklardÄ±r', 'oyuncaklardır'],
        ['sunduÄŸumuz', 'sunduğumuz'],
        ['geniÅŸ', 'geniş'],
        ['yelpazesi', 'yelpazesi'],
        ['bÃ¶lgelerinde', 'bölgelerinde'],
        ['yapÄ±n', 'yapın'],
        ['hÄ±zlÄ±', 'hızlı'],
        ['seÃ§enekleri', 'seçenekleri']
    ];

let totalFixed = 0;

files.forEach(filename => {
    const filepath = path.join(publicDir, filename);

    if (!fs.existsSync(filepath)) {
        console.log(`⚠️ ${filename} - dosya bulunamadı`);
        return;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;
    let changeCount = 0;

    replacements.forEach(([from, to]) => {
        const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
            changeCount += matches.length;
            content = content.replace(regex, to);
        }
    });

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`✅ ${filename} - ${changeCount} değişiklik yapıldı`);
        totalFixed += changeCount;
    } else {
        console.log(`⚪ ${filename} - değişiklik gerekmedi`);
    }
});

console.log(`\\n✅ Toplam ${totalFixed} karakter düzeltildi`);
