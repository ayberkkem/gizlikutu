const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function getAllHtmlFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            // Skip subdirectories for now if flat structure assumed, or recursive if needed
            // results = results.concat(getAllHtmlFiles(fullPath)); 
        } else {
            if (file.endsWith('.html')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const allFiles = getAllHtmlFiles(publicDir);
console.log(`Scanning ${allFiles.length} files for SEO issues...`);

const report = {
    missingTitle: [],
    shortTitle: [],
    missingDescription: [],
    shortDescription: [], // Warning only
    missingH1: [],
    multipleH1: [],
    missingCanonical: [],
    missingOgTitle: [],
    missingAltTags: [] // Array of { file: string, count: number }
};

allFiles.forEach(file => {
    const filename = path.basename(file);
    const content = fs.readFileSync(file, 'utf8');

    // 1. Title
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
        report.missingTitle.push(filename);
    } else if (titleMatch[1].length < 10) {
        report.shortTitle.push(`${filename} ("${titleMatch[1]}")`);
    }

    // 2. Description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (!descMatch) {
        report.missingDescription.push(filename);
    } else if (descMatch[1].length < 50) {
        report.shortDescription.push(`${filename} (${descMatch[1].length} chars)`);
    }

    // 3. H1
    const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
        report.missingH1.push(filename);
    } else if (h1Matches.length > 1) {
        report.multipleH1.push(filename);
    }

    // 4. Canonical
    if (!content.match(/<link\s+rel=["']canonical["'].*?>/i)) {
        report.missingCanonical.push(filename);
    }

    // 5. Open Graph Title
    if (!content.match(/<meta\s+property=["']og:title["'].*?>/i)) {
        report.missingOgTitle.push(filename);
    }

    // 6. Image Alts
    const imgRegex = /<img\s+([^>]*?)>/gi;
    let match;
    let missingCount = 0;
    while ((match = imgRegex.exec(content)) !== null) {
        const attrs = match[1];
        // Check if alt attribute exists
        if (!/alt=["']/.test(attrs)) {
            missingCount++;
        }
    }
    if (missingCount > 0) {
        report.missingAltTags.push({ file: filename, count: missingCount });
    }
});

// Printer
console.log("\n--- SEO AUDIT REPORT ---\n");

function printGroup(title, list) {
    if (list.length === 0) return;
    console.log(`${title} (${list.length} files):`);
    if (list.length > 20) {
        list.slice(0, 15).forEach(f => console.log(`  - ${f}`));
        console.log(`  ... ve ${list.length - 15} dosya daha.`);
    } else {
        list.forEach(f => console.log(`  - ${f}`));
    }
    console.log("");
}

printGroup("EKSİK <TITLE> ETİKETİ", report.missingTitle);
printGroup("KISA <TITLE> (<10 karakter)", report.shortTitle);
printGroup("EKSİK META DESCRIPTION", report.missingDescription);
printGroup("KISA META DESCRIPTION (<50 karakter)", report.shortDescription);
printGroup("EKSİK <H1> ETİKETİ", report.missingH1);
printGroup("ÇOKLU <H1> ETİKETİ (Birden fazla H1 var)", report.multipleH1);
printGroup("EKSİK CANONICAL LINK", report.missingCanonical);
printGroup("EKSİK OG:TITLE", report.missingOgTitle);

if (report.missingAltTags.length > 0) {
    console.log(`ALT ETİKETİ EKSİK GÖRSELLER (${report.missingAltTags.length} file):`);
    report.missingAltTags.slice(0, 50).forEach(item => {
        console.log(`  - ${item.file}: ${item.count} görsel`);
    });
    if (report.missingAltTags.length > 50) console.log(`  ... ve ${report.missingAltTags.length - 50} dosya daha.`);
}

if (
    report.missingTitle.length === 0 &&
    report.missingDescription.length === 0 &&
    report.missingH1.length === 0 &&
    report.missingCanonical.length === 0 &&
    report.missingOgTitle.length === 0 &&
    report.missingAltTags.length === 0
) {
    console.log("✅ HARİKA! Şu an taranan dosyalarda Kritik SEO hatası bulunamadı.");
} else {
    console.log("\n❌ Bazı dosyalar düzeltme gerektiriyor.");
}

console.log("\nAudit Complete.");
