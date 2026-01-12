/**
 * Gizli Kutu - WhatsApp Order Notifier (PRODUCTION)
 * Firestore orders koleksiyonuna yeni sipariş gelince
 * Twilio üzerinden WhatsApp mesajı gönderir
 */

const functions = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");
const axios = require("axios");

// Firebase config üzerinden Twilio bilgileri okunur
const cfg = functions.config().twilio;

/**
 * 🔔 Yeni sipariş tetikleyici
 */
exports.onNewOrder = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap) => {
        const order = snap.data();
        if (!order) {
            logger.error("❌ Order data boş geldi");
            return null;
        }

        const customerName = order.customer?.name || "Bilinmeyen";
        const phone = order.customer?.phone || "-";
        const total = order.payment?.total || 0;
        const orderNo = order.orderNo || "-";

        const productsText = (order.products || [])
            .map((p, i) => `${i + 1}) ${p.title} x${p.qty}`)
            .join("\n");

        // 📦 WhatsApp mesaj içeriği
        const message = `
🛒 YENİ SİPARİŞ

👤 ${customerName}
📞 ${phone}

💰 Toplam: ${total} ₺
🆔 Sipariş No: ${orderNo}

📦 Ürünler:
${productsText}
`;

        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`;

            const payload = new URLSearchParams({
                To: cfg.to,                 // Senin WhatsApp Business numaran
                From: cfg.from,             // Twilio sandbox numarası
                Body: message
            });

            await axios.post(url, payload.toString(), {
                auth: {
                    username: cfg.sid,
                    password: cfg.token
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            logger.info("✅ WhatsApp mesajı başarıyla gönderildi");
        } catch (err) {
            logger.error("❌ WhatsApp gönderim hatası:", err.message);
        }

        return null;
    });
