/**
 * Gizli Kutu - Product Manager Server
 * Ürün ve kategori yönetimi için Node.js sunucusu
 * Export = doğrudan public/data/ dosyalarını günceller
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Paths
const DATA_PATH = path.join(__dirname, '..', 'public', 'data');
const PRODUCTS_FILE = path.join(DATA_PATH, 'products.json');
const CATEGORIES_FILE = path.join(DATA_PATH, 'categories.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// API ROUTES
// =====================

// Get products
app.get('/api/products', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Products okuma hatası:', err);
        res.status(500).json({ error: 'Products okunamadı' });
    }
});

// Save products
app.post('/api/products', (req, res) => {
    try {
        const products = req.body;
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
        console.log('✅ products.json güncellendi');
        res.json({ success: true, message: 'products.json güncellendi' });
    } catch (err) {
        console.error('Products yazma hatası:', err);
        res.status(500).json({ error: 'Products kaydedilemedi' });
    }
});

// Get categories
app.get('/api/categories', (req, res) => {
    try {
        const data = fs.readFileSync(CATEGORIES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Categories okuma hatası:', err);
        res.status(500).json({ error: 'Categories okunamadı' });
    }
});

// Save categories
app.post('/api/categories', (req, res) => {
    try {
        const categories = req.body;
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
        console.log('✅ categories.json güncellendi');
        res.json({ success: true, message: 'categories.json güncellendi' });
    } catch (err) {
        console.error('Categories yazma hatası:', err);
        res.status(500).json({ error: 'Categories kaydedilemedi' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Product Manager çalışıyor!');
    console.log(`📍 http://localhost:${PORT}`);
    console.log('');
    console.log('📁 Products: ' + PRODUCTS_FILE);
    console.log('📁 Categories: ' + CATEGORIES_FILE);
    console.log('');
});
