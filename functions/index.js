/**
 * Gizli Kutu - Order Trigger Function (Twilio WhatsApp)
 */

const functions = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");

exports.onNewOrder = functions
    .runWith({ secrets: ["TWILIO_SID", "TWILIO_TOKEN", "TWILIO_FROM", "TWILIO_TO"] })
    .firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
        const twilio = require("twilio");

        try {
            const sid = process.env.TWILIO_SID;
            const token = process.env.TWILIO_TOKEN;
            const from = process.env.TWILIO_FROM;
            const to = process.env.TWILIO_TO;

            if (!sid || !token || !from || !to) {
                logger.error("❌ Twilio secret bilgileri eksik!");
                return null;
            }

            const client = twilio(sid, token);

            const order = snap.data();
            if (!order) {
                logger.error("❌ Order boş geldi");
                return null;
            }

            logger.info("📦 Yeni sipariş:", JSON.stringify(order));

            // -----------------------
            // 👤 Müşteri Bilgileri
            // -----------------------
            const customerName = order.customer?.name || "-";
            const phone = order.customer?.phone || "-";
            const email = order.customer?.email || "-";
            const note = order.customer?.note || "-";

            // -----------------------
            // 📍 Teslimat Bilgileri
            // -----------------------
            const city = order.delivery?.city || "-";
            const district = order.delivery?.district || "-";
            const address = order.delivery?.address || "-";
            const deliveryType = order.delivery?.type || "-";

            // -----------------------
            // 💳 Ödeme Yöntemi Mapping
            // -----------------------
            const rawPayment =
                order.payment?.method ||
                order.payment?.type ||
                order.payment?.paymentType ||
                "";

            let paymentText = "Bilinmiyor";

            if (typeof rawPayment === "string") {
                const key = rawPayment.toLowerCase();

                if (key.includes("online") || key.includes("card")) {
                    paymentText = "Online Ödeme";
                }
                else if (key.includes("havale") || key.includes("eft") || key.includes("transfer")) {
                    paymentText = "Havale / EFT";
                }
                else if (key.includes("kapida") || key.includes("cash") || key.includes("cod")) {
                    paymentText = "Kapıda Ödeme";
                }
            }

            // -----------------------
            // 💰 Sipariş Bilgileri
            // -----------------------
            const total = order.payment?.total || 0;
            const orderNo = order.orderNo || context.params.orderId;

            // -----------------------
            // 📦 Ürünler
            // -----------------------
            const productsText = (order.products || [])
                .map((p, i) => {
                    return `
${i + 1}) ${p.title}
Adet: ${p.qty}
Fiyat: ${p.price} ₺
Görsel: ${p.image || p.imageUrl || "-"}
`;
                })
                .join("\n----------------------\n");

            // -----------------------
            // 📩 WhatsApp Mesajı
            // -----------------------
            const message = `
🛒 YENİ SİPARİŞ

👤 Müşteri:
${customerName}
📞 ${phone}
📧 ${email}

📍 TESLİMAT BİLGİLERİ
İl: ${city}
İlçe: ${district}
Adres: ${address}

🚚 Teslimat Tipi: ${deliveryType}
💳 Ödeme Yöntemi: ${paymentText}

📝 Sipariş Notu:
${note}

💰 Toplam: ${total} ₺
🆔 Sipariş No: ${orderNo}

📦 ÜRÜNLER
${productsText}
`;

            logger.info("📱 WhatsApp gönderiliyor...");

            const result = await client.messages.create({
                from,
                to,
                body: message,
            });

            logger.info("✅ WhatsApp gönderildi:", result.sid);
            return null;

        } catch (err) {
            logger.error("🔥 WhatsApp gönderim hatası:", err);
            return null;
        }
    });