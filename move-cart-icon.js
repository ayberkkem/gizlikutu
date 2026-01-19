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
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Cart ikonunu bul (multiline support ile)
    const cartRegex = /(<a class="iconbtn cartWrap".*?<\/a>)/s;
    const match = content.match(cartRegex);

    // Sadece desktop-header-nav varsa işlem yap
    if (match && content.includes('class="desktop-header-nav"')) {
        const cartHtml = match[0];

        // Önce içeriği değiştirmeden nav'ın yerini bulalım
        // Çünkü replace yaparsak indexler kayabilir, ama önce silip sonra eklemek daha temiz

        // 1. Cart ikonunu sil
        // replace sadece ilk eşleşmeyi siler, bu da istediğimiz şey (headerdaki)
        let newContent = content.replace(cartHtml, '');

        // 2. Nav'ın kapanışını bulup ekle
        const navStartIdx = newContent.indexOf('class="desktop-header-nav"');
        if (navStartIdx !== -1) {
            // navStartIdx'ten sonraki ilk </nav>
            const navEndIdx = newContent.indexOf('</nav>', navStartIdx);

            if (navEndIdx !== -1) {
                const navCloseTagLength = 6; // </nav>

                const before = newContent.substring(0, navEndIdx + navCloseTagLength);
                const after = newContent.substring(navEndIdx + navCloseTagLength);

                // Araya ekle (biraz boşlukla)
                newContent = before + "\n        " + cartHtml + after;

                fs.writeFileSync(file, newContent, 'utf8');
                console.log(`Moved cart in: ${path.basename(file)}`);
                count++;
            }
        }
    }
});

console.log(`Total files updated: ${count}`);
