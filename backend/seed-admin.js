const admin = require('firebase-admin');

// Emülatör bağlantısı için ortam değişkenlerini ayarla
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
    projectId: 'gizli-kutu'
});

const auth = admin.auth();
const db = admin.firestore();

const adminEmail = 'ayberkkem@gmail.com';
const adminPassword = 'admin160217';

async function seedAdmin() {
    console.log('Admin hesabı oluşturuluyor/güncelleniyor...');

    try {
        let user;
        try {
            user = await auth.getUserByEmail(adminEmail);
            console.log('Kullanıcı zaten mevcut, şifre güncelleniyor...');
            await auth.updateUser(user.uid, {
                password: adminPassword
            });
        } catch (e) {
            user = await auth.createUser({
                email: adminEmail,
                password: adminPassword,
                emailVerified: true
            });
            console.log('Yeni admin kullanıcısı oluşturuldu.');
        }

        // Firestore rolünü ata
        await db.collection('users').doc(user.uid).set({
            email: adminEmail,
            role: 'admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`Başarılı! Admin girişi için:
E-posta: ${adminEmail}
Şifre: ${adminPassword}`);

    } catch (error) {
        console.error('Hata oluştu:', error);
    }
}

seedAdmin();
