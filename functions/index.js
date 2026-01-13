/**
 * Gizli Kutu - Firebase Cloud Functions
 * - Order Trigger (Twilio WhatsApp)
 * - PayTR Payment Integration
 */

const functions = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");

/* =====================================================
   PAYTR ÖDEME ENTEGRASYONU
===================================================== */

/**
 * PayTR Token Oluşturma Endpoint'i
 * Frontend'den çağrılır, PayTR iframe token'ı döner
 */
exports.createPaytrPayment = functions
    .runWith({
        secrets: ["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT"],
    })
    .https.onRequest(async (req, res) => {
        // CORS - Production domain only
        const allowedOrigins = ["https://gizlikutu.online", "https://www.gizlikutu.online"];
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
            res.set("Access-Control-Allow-Origin", origin);
        } else {
            res.set("Access-Control-Allow-Origin", "https://gizlikutu.online");
        }
        res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: "Method not allowed" });
            return;
        }

        try {
            const merchantId = process.env.PAYTR_MERCHANT_ID;
            const merchantKey = process.env.PAYTR_MERCHANT_KEY;
            const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

            if (!merchantId || !merchantKey || !merchantSalt) {
                logger.error("❌ PayTR credentials eksik!");
                res.status(500).json({ success: false, error: "Payment configuration error" });
                return;
            }

            const body = req.body;
            const {
                orderNo,
                email,
                totalAmount, // Kuruş cinsinden (örn: 150.00 TL = 15000)
                userName,
                userPhone,
                userAddress,
                userCity,
                basketItems, // [{name, price, qty}]
            } = body;

            if (!orderNo || !email || !totalAmount || !basketItems) {
                res.status(400).json({ success: false, error: "Missing required fields" });
                return;
            }

            // PayTR parametreleri
            const userIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "85.95.238.1";
            const merchantOid = orderNo;
            const paymentAmount = Math.round(totalAmount * 100); // TL -> Kuruş
            const currency = "TL";
            const testMode = "0"; // 0 = Canlı, 1 = Test
            const noInstallment = "1"; // Taksit yok
            const maxInstallment = "0";

            // Basket JSON (Base64)
            const basketJson = basketItems.map((item) => [
                item.name || "Ürün",
                (Math.round((item.price || 0) * 100)).toString(), // Kuruş
                (item.qty || 1).toString(),
            ]);
            const userBasket = Buffer.from(JSON.stringify(basketJson)).toString("base64");

            // Callback URL'leri
            const merchantNotifyUrl = "https://us-central1-gizli-kutu.cloudfunctions.net/paytrCallback";
            const merchantOkUrl = "https://gizlikutu.online/success.html";
            const merchantFailUrl = "https://gizlikutu.online/checkout.html?error=payment";

            // Hash Token oluştur
            const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}${merchantSalt}`;
            const paytrToken = crypto.createHmac("sha256", merchantKey)
                .update(hashStr)
                .digest("base64");

            // PayTR API'ye istek
            const formData = new URLSearchParams({
                merchant_id: merchantId,
                user_ip: userIp,
                merchant_oid: merchantOid,
                email: email,
                payment_amount: paymentAmount.toString(),
                paytr_token: paytrToken,
                user_basket: userBasket,
                debug_on: "0",
                no_installment: noInstallment,
                max_installment: maxInstallment,
                user_name: userName || "Müşteri",
                user_address: userAddress || "Türkiye",
                user_phone: userPhone || "05000000000",
                merchant_ok_url: merchantOkUrl,
                merchant_fail_url: merchantFailUrl,
                merchant_notify_url: merchantNotifyUrl,
                timeout_limit: "30",
                currency: currency,
                test_mode: testMode,
                lang: "tr",
            });

            logger.info("📤 PayTR API isteği gönderiliyor...", { merchantOid });

            const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            const data = await response.json();

            if (data.status === "success" && data.token) {
                logger.info("✅ PayTR token alındı", { merchantOid });
                res.json({
                    success: true,
                    token: data.token,
                    iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`,
                });
            } else {
                logger.error("❌ PayTR token hatası", data);
                res.status(400).json({
                    success: false,
                    error: data.reason || "Token alınamadı",
                });
            }
        } catch (err) {
            logger.error("🔥 PayTR API hatası:", err);
            res.status(500).json({ success: false, error: "Payment service error" });
        }
    });

/**
 * PayTR Callback Endpoint'i
 * Ödeme sonucu PayTR tarafından çağrılır
 * Başarılı ödemede: Firestore güncelle + WhatsApp gönder
 */
exports.paytrCallback = functions
    .runWith({
        secrets: ["PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT", "TWILIO_SID", "TWILIO_TOKEN", "TWILIO_FROM", "TWILIO_TO"],
    })
    .https.onRequest(async (req, res) => {
        const admin = require("firebase-admin");
        if (!admin.apps.length) {
            admin.initializeApp();
        }
        const db = admin.firestore();

        try {
            const merchantKey = process.env.PAYTR_MERCHANT_KEY;
            const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

            const {
                merchant_oid,
                status,
                total_amount,
                hash,
            } = req.body;

            logger.info("📩 PayTR callback geldi", { merchant_oid, status, total_amount });

            // Hash doğrulama
            const hashStr = `${merchant_oid}${merchantSalt}${status}${total_amount}`;
            const expectedHash = crypto.createHmac("sha256", merchantKey)
                .update(hashStr)
                .digest("base64");

            if (hash !== expectedHash) {
                logger.error("❌ PayTR hash doğrulama hatası", { merchant_oid });
                res.status(400).send("PAYTR notification failed: invalid hash");
                return;
            }

            // Firestore'da siparişi bul (orderNo ile)
            const ordersRef = db.collection("orders");
            const snapshot = await ordersRef.where("orderNo", "==", merchant_oid).limit(1).get();

            if (snapshot.empty) {
                logger.error("❌ Sipariş bulunamadı", { merchant_oid });
                res.send("OK"); // PayTR'ye yine OK dön
                return;
            }

            const orderDoc = snapshot.docs[0];
            const order = orderDoc.data();

            if (status === "success") {
                logger.info("✅ PayTR ödeme başarılı", { merchant_oid, total_amount });

                // Firestore'da durumu güncelle
                await orderDoc.ref.update({
                    "payment.status": "paid",
                    "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
                    "payment.paytrStatus": "success",
                });

                // WhatsApp bildirimi gönder
                try {
                    const twilio = require("twilio");
                    const sid = process.env.TWILIO_SID;
                    const token = process.env.TWILIO_TOKEN;
                    const from = process.env.TWILIO_FROM;
                    const to = process.env.TWILIO_TO;

                    if (sid && token && from && to) {
                        const client = twilio(sid, token);

                        const customerName = order.customer?.name || "-";
                        const phone = order.customer?.phone || "-";
                        const email = order.customer?.email || "-";
                        const city = order.delivery?.city || "-";
                        const district = order.delivery?.district || "-";
                        const address = order.delivery?.address || "-";
                        const note = order.note || "-";
                        const total = order.payment?.total || 0;

                        const productsText = (order.products || [])
                            .map((p, i) => `${i + 1}) ${p.title} - Adet: ${p.qty} - ${p.price}₺`)
                            .join("\n");

                        const message = `
💳 ONLINE ÖDEME BAŞARILI

👤 Müşteri: ${customerName}
📞 ${phone}
📧 ${email}

📍 TESLİMAT
İl: ${city}
İlçe: ${district}
Adres: ${address}

📝 Not: ${note}

💰 Toplam: ${total} ₺
🆔 Sipariş No: ${merchant_oid}

📦 ÜRÜNLER
${productsText}
`;

                        await client.messages.create({ from, to, body: message });
                        logger.info("✅ WhatsApp gönderildi (ödeme başarılı)", { merchant_oid });
                    } else {
                        logger.warn("⚠️ Twilio credentials eksik, WhatsApp gönderilemedi");
                    }
                } catch (whatsappErr) {
                    logger.error("❌ WhatsApp gönderim hatası:", whatsappErr);
                }

            } else {
                logger.warn("⚠️ PayTR ödeme başarısız", { merchant_oid, status });

                // Firestore'da durumu güncelle
                await orderDoc.ref.update({
                    "payment.status": "failed",
                    "payment.paytrStatus": status,
                });
            }

            // PayTR'ye OK yanıtı dön
            res.send("OK");
        } catch (err) {
            logger.error("🔥 PayTR callback hatası:", err);
            res.status(500).send("Error");
        }
    });

/* =====================================================
   SİPARİŞ TETİKLEYİCİ
   - Online ödeme: WhatsApp GÖNDERİLMEZ (paytrCallback'te gönderilir)
   - Havale/EFT, Kapıda Ödeme: WhatsApp gönderilir
===================================================== */

exports.onNewOrder = functions
    .runWith({ secrets: ["TWILIO_SID", "TWILIO_TOKEN", "TWILIO_FROM", "TWILIO_TO"] })
    .firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
        const twilio = require("twilio");

        try {
            const order = snap.data();
            if (!order) {
                logger.error("❌ Order boş geldi");
                return null;
            }

            logger.info("📦 Yeni sipariş oluşturuldu:", { orderNo: order.orderNo });

            // -----------------------
            // 💳 Ödeme Yöntemi Kontrolü
            // -----------------------
            const rawPayment =
                order.payment?.method ||
                order.payment?.type ||
                order.payment?.paymentType ||
                "";

            const paymentKey = typeof rawPayment === "string" ? rawPayment.toLowerCase() : "";

            // Online ödeme ise WhatsApp GÖNDERME - paytrCallback'te gönderilecek
            if (paymentKey.includes("online") || paymentKey.includes("card") || paymentKey.includes("credit")) {
                logger.info("📋 Online ödeme - WhatsApp ödeme başarılı olunca gönderilecek", { orderNo: order.orderNo });
                return null;
            }

            // Havale/EFT veya Kapıda Ödeme ise WhatsApp gönder
            const sid = process.env.TWILIO_SID;
            const token = process.env.TWILIO_TOKEN;
            const from = process.env.TWILIO_FROM;
            const to = process.env.TWILIO_TO;

            if (!sid || !token || !from || !to) {
                logger.error("❌ Twilio secret bilgileri eksik!");
                return null;
            }

            const client = twilio(sid, token);

            // -----------------------
            // 👤 Müşteri Bilgileri
            // -----------------------
            const customerName = order.customer?.name || "-";
            const phone = order.customer?.phone || "-";
            const email = order.customer?.email || "-";
            const note = order.note || "-";

            // -----------------------
            // 📍 Teslimat Bilgileri
            // -----------------------
            const city = order.delivery?.city || "-";
            const district = order.delivery?.district || "-";
            const address = order.delivery?.address || "-";
            const deliveryType = order.delivery?.type || "-";

            // -----------------------
            // 💳 Ödeme Yöntemi Text
            // -----------------------
            let paymentText = "Bilinmiyor";
            if (paymentKey.includes("havale") || paymentKey.includes("eft") || paymentKey.includes("transfer")) {
                paymentText = "Havale / EFT";
            } else if (paymentKey.includes("kapida") || paymentKey.includes("cash") || paymentKey.includes("cod")) {
                paymentText = "Kapıda Ödeme";
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

            logger.info("📱 WhatsApp gönderiliyor (Havale/Kapıda)...");

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