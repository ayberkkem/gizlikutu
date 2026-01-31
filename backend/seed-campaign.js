const admin = require('firebase-admin');

// Emulator support
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'gizli-kutu'
    });
}

const db = admin.firestore();

const DEFAULT_CAMPAIGN_ID = 'VALENTINE_2026';

const defaultRewards = [
    { type: "free_shipping", weight: 40, coupon: "BEDAVA_KARGO", enabled: true, label: "Ücretsiz Kargo" },
    { type: "discount", value: 10, weight: 25, coupon: "GIZLI10", enabled: true, label: "%10 İndirim" },
    { type: "discount", value: 15, weight: 20, coupon: "GIZLI15", enabled: true, label: "%15 İndirim" },
    { type: "discount", value: 20, weight: 10, coupon: "GIZLI20", enabled: true, label: "%20 İndirim" },
    { type: "retry", weight: 30, enabled: true, label: "Tekrar Dene", coupon: "" }
];

async function seedCampaign() {
    console.log('--- Campaign Seeding Started ---');

    const docRef = db.collection('campaigns').doc(DEFAULT_CAMPAIGN_ID);

    // Check if exists
    const docSnap = await docRef.get();

    const campaignData = {
        id: DEFAULT_CAMPAIGN_ID,
        name: 'Sevgililer Günü Çarkı 2026',
        active: true,
        startAt: admin.firestore.Timestamp.now(),
        endAt: admin.firestore.Timestamp.fromDate(new Date('2026-02-15')),
        maxSpins: 2,
        rewards: defaultRewards
    };

    await docRef.set(campaignData);
    console.log(`✅ Campaign Seeded: ${campaignData.name} (${DEFAULT_CAMPAIGN_ID})`);

    // Clear old test session for the user if exists (optional but helpful for verification)
    // console.log('Cleaning old test sessions...');

    console.log('--- Campaign Seeding Completed ---');
}

seedCampaign().catch(console.error);
