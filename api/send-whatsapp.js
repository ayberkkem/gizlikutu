module.exports = async (req, res) => {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderNo, customer, delivery, payment, products, note } = req.body;

        // Twilio Credentials from Environment Variables
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
        const toNumber = process.env.ADMIN_WHATSAPP_NUMBER;   // e.g., 'whatsapp:+905400443445'

        console.log("📨 Sending WhatsApp message...", {
            accountSid: accountSid ? '***' : 'MISSING',
            from: fromNumber,
            to: toNumber
        });

        if (!accountSid || !authToken || !fromNumber || !toNumber) {
            console.error("❌ Missing Twilio credentials");
            return res.status(500).json({ error: 'Server configuration error: Missing Credentials' });
        }

        // Format the message
        let messageBody = `🛒 *1 YENİ SİPARİŞ* 🛒\n\n`;

        // Müşteri Bilgileri
        messageBody += `👤 *Müşteri:*\n`;
        messageBody += `${customer.name}\n`;
        messageBody += `📞 ${customer.phone}\n`;
        messageBody += `📧 ${customer.email || 'Belirtilmedi'}\n\n`;

        // Teslimat Bilgileri
        messageBody += `📍 *TESLİMAT BİLGİLERİ*\n`;
        messageBody += `İl: ${delivery.city}\n`;
        messageBody += `İlçe: ${delivery.district}\n`;
        messageBody += `Adres: ${delivery.address}\n\n`;

        // Ödeme ve Not
        messageBody += `💳 *Ödeme Yöntemi:* ${payment.method === 'transfer' ? 'Havale/EFT' : 'Kapıda Ödeme'}\n\n`;

        if (note) {
            messageBody += `📝 *Sipariş Notu:*\n${note}\n\n`;
        }

        // Toplam Tutar ve Sipariş No
        messageBody += `💰 *Toplam:* ${payment.total} ₺\n`;
        messageBody += `🆔 *Sipariş No:* ${orderNo}\n\n`;

        // Ürünler
        messageBody += `📦 *ÜRÜNLER*\n`;
        products.forEach((p, index) => {
            messageBody += `${index + 1}) *${p.title}*\n`;
            messageBody += `Adet: ${p.qty}\n`;
            messageBody += `Fiyat: ${p.price} ₺\n`;
            if (p.image) {
                messageBody += `Görsel: ${p.image}\n`;
            }
            messageBody += `\n`; // Ürünler arası boşluk
        });

        // Send to Twilio using fetch (no extra dependencies needed)
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const formData = new URLSearchParams();
        formData.append('To', toNumber);
        formData.append('From', fromNumber);
        formData.append('Body', messageBody);

        const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Twilio API Error:", errorText);
            throw new Error(`Twilio API responded with ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("✅ WhatsApp sent successfully, SID:", result.sid);

        return res.status(200).json({ success: true, sid: result.sid });

    } catch (error) {
        console.error("🔥 WhatsApp Critical Error:", error);
        return res.status(500).json({ error: error.message });
    }
};
