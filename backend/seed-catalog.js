const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Emulator support
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'gizli-kutu'
    });
}

const db = admin.firestore();

async function seedCatalog() {
    console.log('--- Catalog Seeding Started ---');

    // 1. Load Data
    const productsPath = path.join(__dirname, '../public/data/products.json');
    const categoriesPath = path.join(__dirname, '../public/data/categories.json');

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

    // Create a map for quick category lookup
    const catMap = {};
    categories.forEach(c => {
        catMap[c.id] = c.label;
    });

    console.log(`Loading ${categories.length} categories...`);

    // 2. Seed Categories
    for (const cat of categories) {
        await db.collection('categories').doc(cat.id).set({
            name: cat.label,
            slug: cat.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`- Category Seeded: ${cat.label}`);
    }

    console.log(`Loading ${products.length} products...`);

    // 3. Seed Products
    for (const p of products) {
        // Map category slug to readable label for admin panel
        const catName = catMap[p.category] || p.category;

        await db.collection('products').doc(p.id).set({
            title: p.title,
            description: p.description || '',
            price: p.price || 0,
            category: catName, // Label for UI
            categorySlug: p.category, // Slug for logic
            images: p.images || [],
            active: p.active !== false,
            slug: p.slug,
            isAdult: true, // Defaulting to true for this store's nature
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`- Product Seeded: ${p.title}`);
    }

    console.log('--- Catalog Seeding Completed Successfully ---');
}

seedCatalog().catch(console.error);
