/**
 * Vercel Serverless Function - Sipariş E-posta Bildirimi
 * Bu API sipariş tamamlandığında ayberkkem@gmail.com adresine mail gönderir
 */

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
        const NOTIFICATION_EMAIL = 'ayberkkem@gmail.com';

        if (!RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY eksik veya bulunamadı!');
            return res.status(500).json({ success: false, error: 'Yapılandırma hatası: API Key bulunamadı.' });
        }

        const {
            orderNo,
            customerName,
            customerPhone,
            customerEmail,
            city,
            district,
            address,
            deliveryType,
            paymentMethod,
            orderNote,
            total,
            items // [{name, qty, price, image}]
        } = req.body;

        // Ürün listesi HTML oluştur
        let productsHtml = '';
        if (items && items.length > 0) {
            items.forEach((item, index) => {
                productsHtml += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #e11d48;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 80px; vertical-align: top;">
                                <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
                            </td>
                            <td style="padding-left: 15px; vertical-align: top;">
                                <strong style="color: #1f2937; font-size: 14px;">${index + 1}) ${item.name}</strong><br>
                                <span style="color: #6b7280; font-size: 13px;">Adet: ${item.qty}</span><br>
                                <span style="color: #e11d48; font-weight: bold; font-size: 14px;">Fiyat: ${item.price} ₺</span>
                            </td>
                        </tr>
                    </table>
                </div>`;
            });
        }

        // Ödeme yöntemi Türkçe
        const paymentMethodTr = {
            'card': 'Kredi/Banka Kartı',
            'bank': 'Havale / EFT',
            'cod': 'Kapıda Ödeme'
        }[paymentMethod] || paymentMethod;

        // Teslimat tipi Türkçe
        const deliveryTypeTr = deliveryType === 'cargo' ? 'Kargo ile Teslimat' : 'Mağazadan Teslim';

        // E-posta HTML içeriği
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be185d 100%); padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🛒 YENİ SİPARİŞ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Gizli Kutu - ${new Date().toLocaleString('tr-TR')}</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            
            <!-- Müşteri Bilgileri -->
            <div style="margin-bottom: 25px; padding: 20px; background: #fdf2f8; border-radius: 12px;">
                <h2 style="color: #be185d; margin: 0 0 15px 0; font-size: 16px;">👤 MÜŞTERİ BİLGİLERİ</h2>
                <p style="margin: 5px 0; color: #1f2937;"><strong>${customerName}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">📞 ${customerPhone}</p>
                <p style="margin: 5px 0; color: #6b7280;">📧 ${customerEmail}</p>
            </div>

            <!-- Teslimat Bilgileri -->
            <div style="margin-bottom: 25px; padding: 20px; background: #f0fdf4; border-radius: 12px;">
                <h2 style="color: #16a34a; margin: 0 0 15px 0; font-size: 16px;">📍 TESLİMAT BİLGİLERİ</h2>
                <p style="margin: 5px 0; color: #1f2937;"><strong>İl:</strong> ${city}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>İlçe:</strong> ${district}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Adres:</strong> ${address}</p>
            </div>

            <!-- Sipariş Detayları -->
            <div style="margin-bottom: 25px; padding: 20px; background: #eff6ff; border-radius: 12px;">
                <h2 style="color: #2563eb; margin: 0 0 15px 0; font-size: 16px;">📋 SİPARİŞ DETAYLARI</h2>
                <p style="margin: 5px 0; color: #1f2937;">🚚 <strong>Teslimat:</strong> ${deliveryTypeTr}</p>
                <p style="margin: 5px 0; color: #1f2937;">💳 <strong>Ödeme:</strong> ${paymentMethodTr}</p>
                ${orderNote ? `<p style="margin: 5px 0; color: #1f2937;">📝 <strong>Not:</strong> ${orderNote}</p>` : ''}
            </div>

            <!-- Toplam ve Sipariş No -->
            <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #92400e; font-size: 28px; font-weight: bold;">💰 ${total} ₺</p>
                <p style="margin: 0; color: #78350f; font-size: 14px;">🆔 Sipariş No: <strong>${orderNo}</strong></p>
            </div>

            <!-- Ürünler -->
            <div style="margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📦 ÜRÜNLER</h2>
                ${productsHtml}
            </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>Bu e-posta Gizli Kutu sipariş sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>`;

        // Plain text versiyonu
        let itemsText = '';
        if (items && items.length > 0) {
            items.forEach((item, index) => {
                itemsText += `\n${index + 1}) ${item.name}\n   Adet: ${item.qty}\n   Fiyat: ${item.price} ₺\n   Görsel: ${item.image}\n`;
            });
        }

        const emailText = `🛒 YENİ SİPARİŞ

👤 Müşteri:
${customerName}
📞 ${customerPhone}
📧 ${customerEmail}

📍 TESLİMAT BİLGİLERİ
İl: ${city}
İlçe: ${district}
Adres: ${address}

🚚 Teslimat Tipi: ${deliveryTypeTr}
💳 Ödeme Yöntemi: ${paymentMethodTr}

📝 Sipariş Notu:
${orderNote || '-'}

💰 Toplam: ${total} ₺
🆔 Sipariş No: ${orderNo}

📦 ÜRÜNLER
${itemsText}`;

        // Resend API ile e-posta gönder
        console.log('📧 Resend isteği gönderiliyor...', { to: NOTIFICATION_EMAIL, orderNo });

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev', // Sadece bu adrese izin verilir
                to: [NOTIFICATION_EMAIL],
                subject: `YENI SIPARIS: ${orderNo} - ${customerName}`,
                html: emailHtml,
                text: emailText
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Resend Başarılı:', result.id);
            return res.json({ success: true, messageId: result.id });
        } else {
            console.error('❌ Resend Hatası:', JSON.stringify(result));
            return res.status(400).json({ success: false, error: result.message || JSON.stringify(result) });
        }

    } catch (err) {
        console.error('🔥 E-posta API hatası:', err);
        return res.status(500).json({ success: false, error: 'Email service error' });
    }
};
