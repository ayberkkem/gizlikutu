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
            if (file.endsWith('.html') && file !== 'cities.html') { // cities.html hariç
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const files = getAllFiles(publicDir);

let stats = {
    totalFiles: files.length,
    fixedCanonical: 0,
    fixedFooter: 0,
    cargoDistribution: {
        'Aras': 0,
        'Yurtici': 0,
        'PTT': 0,
        'UPS': 0,
        'MNG': 0,
        'MotoKurye': 0, // Akhisar
        'Unknown': 0
    }
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    const filename = path.basename(file);

    // -------------------------------------------------------
    // 1. CANONICAL KONTROL VE DÜZELTME
    // -------------------------------------------------------
    const expectedCanonical = `https://gizlikutu.online/${filename}`;
    const canonicalTag = `<link rel="canonical" href="${expectedCanonical}">`;

    // Mevcut canonical var mı?
    const hasCorrectCanonical = content.includes(expectedCanonical);

    if (!hasCorrectCanonical) {
        // Eski/Yanlış canonical varsa sil
        content = content.replace(/<link rel="canonical"[^>]*>/g, '');

        // Yenisini Head içine ekle
        if (content.includes('<head>')) {
            content = content.replace('<head>', `<head>\n  ${canonicalTag}`);
        }
        stats.fixedCanonical++;
    }

    // -------------------------------------------------------
    // 2. İÇERİK ÇEŞİTLİLİĞİ ANALİZİ (İSTATİSTİK)
    // -------------------------------------------------------
    // Hangi kargo firması geçiyor?
    let cargoFound = false;
    if (content.includes('Aras Kargo')) { stats.cargoDistribution['Aras']++; cargoFound = true; }
    else if (content.includes('Yurtiçi Kargo')) { stats.cargoDistribution['Yurtici']++; cargoFound = true; }
    else if (content.includes('PTT Kargo')) { stats.cargoDistribution['PTT']++; cargoFound = true; }
    else if (content.includes('UPS Kargo')) { stats.cargoDistribution['UPS']++; cargoFound = true; }
    else if (content.includes('MNG Kargo')) { stats.cargoDistribution['MNG']++; cargoFound = true; }
    else if (content.includes('Motor Kurye') || filename.includes('akhisar')) { stats.cargoDistribution['MotoKurye']++; cargoFound = true; }

    if (!cargoFound) stats.cargoDistribution['Unknown']++;


    // -------------------------------------------------------
    // 3. FOOTER LINK KONTROLÜ
    // -------------------------------------------------------
    if (!content.includes('href="./cities.html"')) {
        if (content.includes('<a href="./contact.html">İletişim</a>')) {
            content = content.replace('<a href="./contact.html">İletişim</a>', '<a href="./contact.html">İletişim</a> • <a href="./cities.html">Hizmet Bölgelerimiz</a>');
            stats.fixedFooter++;
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

// Cities.html kontrol
const citiesPath = path.join(publicDir, 'cities.html');
const citiesExists = fs.existsSync(citiesPath);


console.log("SEO AUDIT REPORT");
console.log("------------------------------------------------");
console.log(`Total Files Scanned: ${stats.totalFiles}`);
console.log(`------------------------------------------------`);
console.log(`1. CANONICAL TAGS:`);
console.log(`   - Fixed/Added in: ${stats.fixedCanonical} files.`);
console.log(`   - Others were already correct.`);
console.log(`------------------------------------------------`);
console.log(`2. FOOTER LINKS (Internal Linking):`);
console.log(`   - Fixed/Added in: ${stats.fixedFooter} files.`);
console.log(`   - Cities.html Exists: ${citiesExists ? 'YES' : 'NO'}`);
console.log(`------------------------------------------------`);
console.log(`3. CONTENT UNIQUENESS (Cargo Distribution):`);
console.log(`   - Aras Kargo Pages:    ${stats.cargoDistribution['Aras']}`);
console.log(`   - Yuirtiçi Kargo Pages: ${stats.cargoDistribution['Yurtici']}`);
console.log(`   - PTT Kargo Pages:     ${stats.cargoDistribution['PTT']}`);
console.log(`   - UPS Kargo Pages:     ${stats.cargoDistribution['UPS']}`);
console.log(`   - MNG Kargo Pages:     ${stats.cargoDistribution['MNG']}`);
console.log(`   - Moto Kurye (Akhisar): ${stats.cargoDistribution['MotoKurye']}`);
console.log(`   - Unassigned/Unknown:  ${stats.cargoDistribution['Unknown']}`);
console.log("------------------------------------------------");
