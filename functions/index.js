/**
 * Gizli Kutu - Firebase Cloud Functions
 * - PayTR Payment Integration
 * - Twilio WhatsApp Notifications
 */

const functions = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");

/* =====================================================
   TWILIO WHATSAPP BİLDİRİM FONKSİYONU
===================================================== */

/**
 * WhatsApp bildirimi gönder
 * @param {object} order - Sipariş verisi
 * @param {string} orderType - "new" | "paid"
 */
async function sendWhatsAppNotification(order, orderType = "new") {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
        const toNumber = process.env.MY_WHATSAPP_NUMBER;

        if (!accountSid || !authToken || !fromNumber || !toNumber) {
            logger.warn("⚠️ Twilio credentials eksik, WhatsApp bildirimi atlandı");
            return false;
        }

        const twilio = require("twilio");
        const client = twilio(accountSid, authToken);

        // Ödeme yöntemi belirleme
        const paymentMethod = order.payment?.method === "online" ? "💳 Kredi Kartı" :
            order.payment?.method === "transfer" ? "🏦 Havale/EFT" : "💵 Kapıda Ödeme";

        // Ürün listesi
        const productList = (order.products || [])
            .map(p => `• ${p.title} x${p.qty}`)
            .join("\n");

        // Mesaj şablonu
        let message = "";
        if (orderType === "paid") {
            message = `✅ *ÖDEME ALINDI*\n\n` +
                `📦 Sipariş: ${order.orderNo}\n` +
                `👤 ${order.customer?.name}\n` +
                `📱 ${order.customer?.phone}\n` +
                `💰 ${order.payment?.total} TL\n` +
                `${paymentMethod}\n\n` +
                `📍 ${order.delivery?.district}, ${order.delivery?.city}\n\n` +
                `${productList}`;
        } else {
            message = `🛒 *YENİ SİPARİŞ*\n\n` +
                `📦 Sipariş: ${order.orderNo}\n` +
                `👤 ${order.customer?.name}\n` +
                `📱 ${order.customer?.phone}\n` +
                `💰 ${order.payment?.total} TL\n` +
                `${paymentMethod}\n\n` +
                `📍 ${order.delivery?.address}\n` +
                `${order.delivery?.district}, ${order.delivery?.city}\n\n` +
                `${productList}`;
        }

        await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber,
        });

        logger.info("✅ WhatsApp bildirimi gönderildi", { orderNo: order.orderNo, type: orderType });
        return true;
    } catch (err) {
        logger.error("❌ WhatsApp bildirim hatası:", err);
        return false;
    }
}

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
            // Vercel üzerinden proxy yaptığımız URL'yi kullanıyoruz
            const merchantNotifyUrl = "https://gizlikutu.online/api/paytr/notify";
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
 * Başarılı ödemede: Firestore güncelle + WhatsApp bildirimi
 */
exports.paytrCallback = functions
    .runWith({
        secrets: ["PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "MY_WHATSAPP_NUMBER"],
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

            // Hash doğrulama (PayTR callback format: SHA256 concat, not HMAC)
            const hashStr = merchant_oid + merchantSalt + status + total_amount;
            const expectedHash = crypto.createHash("sha256")
                .update(hashStr + merchantKey)
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
                logger.info("❌ Sipariş bulunamadı (Idempotency için OK)", { merchant_oid });
                res.send("OK");
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
                await sendWhatsAppNotification(order, "paid");

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
   SİPARİŞ TETİKLEYİCİ (Havale/EFT & Kapıda Ödeme)
===================================================== */
exports.onNewOrder = functions
    .runWith({
        secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "MY_WHATSAPP_NUMBER"],
    })
    .firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
        const order = snap.data();
        if (!order) return null;

        logger.info("📦 Yeni sipariş:", { orderNo: order.orderNo, method: order.payment?.method });

        // Online ödeme için bildirim gönderme (paytrCallback hallediyor)
        if (order.payment?.method === "online") {
            logger.info("⏳ Online ödeme - PayTR callback beklenecek");
            return null;
        }

        // Havale/EFT veya Kapıda Ödeme için hemen bildirim gönder
        const result = await sendWhatsAppNotification(order, "new");
        logger.info("📲 WhatsApp sonucu:", { orderNo: order.orderNo, sent: result });
        return null;
    });

/* =====================================================
   WHATSAPP TEST ENDPOINT (Geliştirme için)
===================================================== */
exports.testWhatsApp = functions
    .runWith({
        secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "MY_WHATSAPP_NUMBER"],
    })
    .https.onRequest(async (req, res) => {
        // CORS
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        logger.info("🧪 WhatsApp test başlatıldı");

        // Secrets kontrol
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
        const toNumber = process.env.MY_WHATSAPP_NUMBER;

        logger.info("🔑 Secrets kontrol:", {
            hasSid: !!accountSid,
            hasToken: !!authToken,
            from: fromNumber,
            to: toNumber,
        });

        if (!accountSid || !authToken || !fromNumber || !toNumber) {
            res.status(500).json({
                success: false,
                error: "Twilio credentials eksik",
                details: {
                    hasSid: !!accountSid,
                    hasToken: !!authToken,
                    hasFrom: !!fromNumber,
                    hasTo: !!toNumber,
                },
            });
            return;
        }

        try {
            const twilio = require("twilio");
            const client = twilio(accountSid, authToken);

            const message = await client.messages.create({
                body: "🧪 *TEST* - Gizli Kutu WhatsApp bildirimi çalışıyor!",
                from: fromNumber,
                to: toNumber,
            });

            logger.info("✅ Test mesajı gönderildi", { sid: message.sid });
            res.json({
                success: true,
                messageSid: message.sid,
                status: message.status,
            });
        } catch (err) {
            logger.error("❌ Test hatası:", err);
            res.status(500).json({
                success: false,
                error: err.message,
                code: err.code,
            });
        }
    });