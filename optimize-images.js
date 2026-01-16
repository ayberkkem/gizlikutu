/**
 * Image Optimization Script for Gizli Kutu Website
 * Uses Sharp library to convert images to WebP format with optimal compression
 * 
 * Usage: node optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// Images to optimize with their settings
const IMAGES_TO_OPTIMIZE = [
    {
        input: path.join(ASSETS_DIR, 'backgrounds', 'glitter-bg.png'),
        output: path.join(ASSETS_DIR, 'backgrounds', 'glitter-bg.webp'),
        options: { quality: 75 }
    },
    {
        input: path.join(ASSETS_DIR, 'backgrounds', 'premium-bg.jpg.png'),
        output: path.join(ASSETS_DIR, 'backgrounds', 'premium-bg.webp'),
        options: { quality: 80 }
    },
    {
        input: path.join(ASSETS_DIR, 'blog-banner-neon.jpg'),
        output: path.join(ASSETS_DIR, 'blog-banner-neon.webp'),
        options: { quality: 80 }
    },
    {
        input: path.join(ASSETS_DIR, 'logo.jpg'),
        output: path.join(ASSETS_DIR, 'logo.webp'),
        options: { quality: 85 }
    },
    {
        input: path.join(ASSETS_DIR, 'splash.jpg'),
        output: path.join(ASSETS_DIR, 'splash.webp'),
        options: { quality: 80 }
    }
];

async function getFileSize(filePath) {
    try {
        const stats = await fs.promises.stat(filePath);
        return stats.size;
    } catch {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function optimizeImage(config) {
    const { input, output, options } = config;

    console.log(`\n📷 Processing: ${path.basename(input)}`);

    // Check if input exists
    if (!fs.existsSync(input)) {
        console.log(`   ⚠️ File not found: ${input}`);
        return null;
    }

    const inputSize = await getFileSize(input);
    console.log(`   Original size: ${formatBytes(inputSize)}`);

    try {
        await sharp(input)
            .webp(options)
            .toFile(output);

        const outputSize = await getFileSize(output);
        const savings = inputSize - outputSize;
        const savingsPercent = ((savings / inputSize) * 100).toFixed(1);

        console.log(`   WebP size: ${formatBytes(outputSize)}`);
        console.log(`   ✅ Saved: ${formatBytes(savings)} (${savingsPercent}%)`);

        return { input, output, inputSize, outputSize, savings };
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting image optimization...\n');
    console.log('='.repeat(50));

    let totalInputSize = 0;
    let totalOutputSize = 0;
    const results = [];

    for (const config of IMAGES_TO_OPTIMIZE) {
        const result = await optimizeImage(config);
        if (result) {
            results.push(result);
            totalInputSize += result.inputSize;
            totalOutputSize += result.outputSize;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   Files processed: ${results.length}`);
    console.log(`   Total original size: ${formatBytes(totalInputSize)}`);
    console.log(`   Total WebP size: ${formatBytes(totalOutputSize)}`);
    console.log(`   Total savings: ${formatBytes(totalInputSize - totalOutputSize)}`);
    console.log(`   Compression ratio: ${((totalOutputSize / totalInputSize) * 100).toFixed(1)}%`);

    console.log('\n✨ Optimization complete!');
    console.log('\n⚠️ IMPORTANT: Update your CSS and HTML files to use .webp files instead of .png/.jpg');
    console.log('   - CSS: Change background-image URLs');
    console.log('   - HTML: Use <picture> element with WebP source for fallback support');
}

main().catch(console.error);
