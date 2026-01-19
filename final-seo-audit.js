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
            if (file.endsWith('.html') && file !== 'cities.html') {
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
    cargoDistribution: {
        'Aras': 0,
        'Yurtici': 0,
        'PTT': 0,
        'UPS': 0,
        'MNG': 0,
        'DHL': 0,
        'Surat': 0,
        'MotoKurye': 0,
        'Unknown': 0
    }
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    const filename = path.basename(file);

    // Canonical
    const expectedCanonical = `https://gizlikutu.online/${filename}`;
    const canonicalTag = `<link rel="canonical" href="${expectedCanonical}">`;
    if (!content.includes(expectedCanonical)) {
        content = content.replace(/<link rel="canonical"[^>]*>/g, '');
        if (content.includes('<head>')) {
            content = content.replace('<head>', `<head>\n  ${canonicalTag}`);
        }
        stats.fixedCanonical++;
    }

    // Cargo Stats
    let cargoFound = false;
    if (content.includes('Aras Kargo')) { stats.cargoDistribution['Aras']++; cargoFound = true; }
    else if (content.includes('Yurtiçi Kargo')) { stats.cargoDistribution['Yurtici']++; cargoFound = true; }
    else if (content.includes('PTT Kargo')) { stats.cargoDistribution['PTT']++; cargoFound = true; }
    else if (content.includes('UPS Kargo')) { stats.cargoDistribution['UPS']++; cargoFound = true; }
    else if (content.includes('MNG Kargo')) { stats.cargoDistribution['MNG']++; cargoFound = true; }
    else if (content.includes('DHL')) { stats.cargoDistribution['DHL']++; cargoFound = true; }
    else if (content.includes('Sürat Kargo')) { stats.cargoDistribution['Surat']++; cargoFound = true; }
    else if (content.includes('Motor Kurye') || filename.includes('akhisar')) { stats.cargoDistribution['MotoKurye']++; cargoFound = true; }

    if (!cargoFound) stats.cargoDistribution['Unknown']++;

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log("SEO AUDIT REPORT (UPDATED)");
console.log("------------------------------------------------");
console.log(`Total Files: ${stats.totalFiles}`);
console.log("------------------------------------------------");
console.log(`CARGO DISTRIBUTION:`);
console.log(`   - Aras:      ${stats.cargoDistribution['Aras']}`);
console.log(`   - Yurtici:   ${stats.cargoDistribution['Yurtici']}`);
console.log(`   - PTT:       ${stats.cargoDistribution['PTT']}`);
console.log(`   - UPS:       ${stats.cargoDistribution['UPS']}`);
console.log(`   - MNG:       ${stats.cargoDistribution['MNG']}`);
console.log(`   - DHL:       ${stats.cargoDistribution['DHL']}`);
console.log(`   - Surat:     ${stats.cargoDistribution['Surat']}`);
console.log(`   - MotoKurye: ${stats.cargoDistribution['MotoKurye']}`);
console.log(`   - Unknown:   ${stats.cargoDistribution['Unknown']}`);
console.log("------------------------------------------------");
