const crypto = require('crypto');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://gizlikutu.online');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const merchantId = process.env.PAYTR_MERCHANT_ID;
        const merchantKey = process.env.PAYTR_MERCHANT_KEY;
        const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

        if (!merchantId || !merchantKey || !merchantSalt) {
            console.error('❌ PayTR credentials eksik!');
            return res.status(500).json({ success: false, error: 'Payment configuration error' });
        }

        const {
            orderNo,
            email,
            totalAmount,
            userName,
            userPhone,
            userAddress,
            userCity,
            basketItems,
        } = req.body;

        if (!orderNo || !email || !totalAmount || !basketItems) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // PayTR parametreleri
        const userIp = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || '85.95.238.1';
        const merchantOid = orderNo;
        const paymentAmount = Math.round(totalAmount * 100);
        const currency = 'TL';
        const testMode = '0';
        const noInstallment = '1';
        const maxInstallment = '0';

        // Basket JSON (Base64)
        const basketJson = basketItems.map((item) => [
            item.name || 'Ürün',
            (Math.round((item.price || 0) * 100)).toString(),
            (item.qty || 1).toString(),
        ]);
        const userBasket = Buffer.from(JSON.stringify(basketJson)).toString('base64');

        // Callback URL'leri
        const merchantNotifyUrl = 'https://gizlikutu.online/api/paytr-callback';
        const merchantOkUrl = 'https://gizlikutu.online/success.html';
        const merchantFailUrl = 'https://gizlikutu.online/checkout.html?error=payment';

        // Hash Token oluştur
        const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}${merchantSalt}`;
        const paytrToken = crypto.createHmac('sha256', merchantKey)
            .update(hashStr)
            .digest('base64');

        // PayTR API'ye istek
        const formData = new URLSearchParams({
            merchant_id: merchantId,
            user_ip: userIp,
            merchant_oid: merchantOid,
            email: email,
            payment_amount: paymentAmount.toString(),
            paytr_token: paytrToken,
            user_basket: userBasket,
            debug_on: '1',
            no_installment: noInstallment,
            max_installment: maxInstallment,
            user_name: userName || 'Müşteri',
            user_address: userAddress || 'Türkiye',
            user_phone: userPhone || '05000000000',
            merchant_ok_url: merchantOkUrl,
            merchant_fail_url: merchantFailUrl,
            merchant_notify_url: merchantNotifyUrl,
            timeout_limit: '30',
            currency: currency,
            test_mode: testMode,
            lang: 'tr',
        });

        console.log('📤 PayTR API isteği gönderiliyor...', { merchantOid });

        const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });

        const data = await response.json();

        if (data.status === 'success' && data.token) {
            console.log('✅ PayTR token alındı', { merchantOid });
            return res.json({
                success: true,
                token: data.token,
                iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`,
            });
        } else {
            console.error('❌ PayTR token hatası', data);
            return res.status(400).json({
                success: false,
                error: data.reason || 'Token alınamadı',
            });
        }
    } catch (err) {
        console.error('🔥 PayTR API hatası:', err);
        return res.status(500).json({ success: false, error: 'Payment service error' });
    }
};
