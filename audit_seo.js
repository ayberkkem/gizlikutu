const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Helper to find files
function getFiles(dir, filter) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    let matched = [];
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // Recursive scan if needed, but we are looking at public root for these
        } else if (filter(file)) {
            matched.push(fullPath);
        }
    });
    return matched;
}

// 1. Core Pages (excluding generated cities)
const coreFiles = getFiles(publicDir, f => f.endsWith('.html') && !f.includes('-sex-shop.html'));

// 2. Sample City Pages
const sampleCities = [
    'persembe-sex-shop.html',
    'sapanca-sex-shop.html',
    'hanak-sex-shop.html',
    'suloglu-sex-shop.html',
    'palu-sex-shop.html'
].map(f => path.join(publicDir, f));

const allFiles = [...coreFiles, ...sampleCities];

console.log(`Scanning ${allFiles.length} files...`);
console.log("-".repeat(50));

const issues = {};

allFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const filename = path.basename(file);
    const fileIssues = [];

    // 1. Title Check
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) {
        fileIssues.push("Missing <title> tag");
    } else if (titleMatch[1].trim().length === 0) {
        fileIssues.push("Empty <title> tag");
    } else if (titleMatch[1].length < 10) {
        fileIssues.push("Title too short (< 10 chars): " + titleMatch[1]);
    } else if (titleMatch[1].includes("Document") || titleMatch[1].includes("Page Title")) {
        fileIssues.push("Default title detected: " + titleMatch[1]);
    }

    // 2. Description Meta Check
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (!descMatch) {
        fileIssues.push("Missing meta description");
    } else if (descMatch[1].trim().length === 0) {
        fileIssues.push("Empty meta description");
    } else if (descMatch[1].length < 50) {
        // fileIssues.push("Meta description too short (< 50 chars)"); // Warning
    }

    // 3. H1 Check
    const h1Match = content.match(/<h1.*?>(.*?)<\/h1>/i);
    if (!h1Match) {
        fileIssues.push("Missing <h1> tag");
    } else if (h1Match[1].trim().length === 0) {
        fileIssues.push("Empty <h1> tag");
    }

    // 4. Canonical Check
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
    if (!canonicalMatch) {
        fileIssues.push("Missing canonical link");
    }

    // 5. Image Alt Check
    const imgRegex = /<img\s+([^>]*?)>/gi;
    let match;
    let missingAltCount = 0;
    while ((match = imgRegex.exec(content)) !== null) {
        const attrs = match[1];
        if (!/alt=["']/.test(attrs) || /alt=["']\s*["']/.test(attrs)) {
            missingAltCount++;
        }
    }
    if (missingAltCount > 0) {
        fileIssues.push(`${missingAltCount} images missing alt text`);
    }

    if (fileIssues.length > 0) {
        issues[filename] = fileIssues;
    }
});

// Output Report
if (Object.keys(issues).length === 0) {
    console.log("No critical SEO issues found in scanned files.");
} else {
    Object.keys(issues).forEach(f => {
        console.log(`FILE: ${f}`);
        issues[f].forEach(i => console.log(`  - [X] ${i}`));
        console.log("");
    });
}
