const crypto = require('crypto');

// Firebase Admin SDK (Vercel'de environment variable ile)
let admin;
let db;

async function initFirebase() {
    if (!admin) {
        admin = require('firebase-admin');
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
        db = admin.firestore();
    }
    return db;
}

module.exports = async (req, res) => {
    // PayTR callback için CORS gerekmiyor, POST body parse edilmeli
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const merchantKey = process.env.PAYTR_MERCHANT_KEY;
        const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

        const {
            merchant_oid,
            status,
            total_amount,
            hash,
        } = req.body;

        console.log('📩 PayTR callback geldi', { merchant_oid, status, total_amount });

        // Hash doğrulama
        const hashStr = `${merchant_oid}${merchantSalt}${status}${total_amount}`;
        const expectedHash = crypto.createHmac('sha256', merchantKey)
            .update(hashStr)
            .digest('base64');

        if (hash !== expectedHash) {
            console.error('❌ PayTR hash doğrulama hatası', { merchant_oid });
            return res.status(400).send('PAYTR notification failed: invalid hash');
        }

        // Firestore güncelle
        const firestore = await initFirebase();
        const ordersRef = firestore.collection('orders');
        const snapshot = await ordersRef.where('orderNo', '==', merchant_oid).limit(1).get();

        if (!snapshot.empty) {
            const docRef = snapshot.docs[0].ref;

            if (status === 'success') {
                console.log('✅ PayTR ödeme başarılı', { merchant_oid, total_amount });
                await docRef.update({
                    'payment.status': 'paid',
                    'payment.paytrStatus': 'success',
                    'payment.paidAt': admin.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                console.warn('⚠️ PayTR ödeme başarısız', { merchant_oid, status });
                await docRef.update({
                    'payment.status': 'failed',
                    'payment.paytrStatus': status,
                });
            }
        } else {
            console.warn('⚠️ Sipariş bulunamadı:', merchant_oid);
        }

        // PayTR'ye OK yanıtı
        return res.status(200).send('OK');
    } catch (err) {
        console.error('🔥 PayTR callback hatası:', err);
        return res.status(500).send('Error');
    }
};
