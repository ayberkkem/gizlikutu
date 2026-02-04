(function () {
  const { qs, money, toast } = window.GK;

  /* ==========================
     PAYTR VERCEL API URL
  ========================== */
  const PAYTR_FUNCTION_URL = "/api/paytr-token";

  /* ==========================
     TOPLAM HESAPLAMA
  ========================== */
  /**
   * TOPLAM HESAPLAMA (Centralized via GKPricing)
   */
  function calcTotal() {
    const cart = window.GKStorage.readCart();
    const appliedCoupon = window.GKStorage.readCoupon();
    const pricing = window.GKPricing.calculate(cart, appliedCoupon);

    const elSub = qs("#sumSubtotal");
    const elShip = qs("#sumShipping");
    const elTot = qs("#sumTotal");
    const elDisc = qs("#sumDiscount");
    const discLine = qs("#discountLine");

    if (elSub) elSub.textContent = pricing.subtotalStr;
    if (elShip) elShip.textContent = pricing.shippingStr;
    if (elTot) elTot.textContent = pricing.totalStr;

    if (pricing.discountKurus > 0) {
      if (elDisc) elDisc.textContent = "-" + pricing.discountStr;
      if (discLine) discLine.style.display = "flex";
    } else {
      if (discLine) discLine.style.display = "none";
    }

    return {
      subtotalKurus: pricing.subtotalKurus,
      shippingKurus: pricing.shippingKurus,
      discountKurus: pricing.discountKurus,
      totalKurus: pricing.totalKurus,
      cart
    };
  }

  const totals = calcTotal();

  const wrap = qs("#checkoutWrap");
  if (!wrap) return;

  if (totals.cart.length === 0) {
    // Eğer sepet sayfasındaysak (cartBody varsa), sepet sayfasının kendi "boş" uyarısı çalışsın.
    // Sadece direkt checkout.html sayfasındaysak tüm sayfayı "boş" yapalım.
    if (!qs("#cartBody")) {
      wrap.innerHTML = `
        <div class="notice">
          Sepetin boş.
          <a href="./products.html" style="text-decoration:underline">Ürünlere git</a>
        </div>`;
    }
    return;
  }

  const form = qs("#checkoutForm");
  const submitBtn = qs("#submitOrder");
  if (!form || !submitBtn) return;

  /* ==========================
     PAYTR IFRAME MODAL (PC & Mobile/PWA Responsive)
  ========================== */
  /* PayTR modal logic removed - CoD only policy */

  /* ==========================
     E-POSTA BİLDİRİMİ GÖNDER
  ========================== */
  async function sendOrderEmail(orderData, totals) {
    try {
      const emailPayload = {
        orderNo: orderData.orderNo,
        customerName: orderData.customer.name,
        customerPhone: orderData.customer.phone,
        customerEmail: orderData.customer.email,
        city: orderData.delivery.city,
        district: orderData.delivery.district,
        address: orderData.delivery.address,
        deliveryType: orderData.delivery.type,
        paymentMethod: orderData.payment.method === "online" ? "card" :
          orderData.payment.method === "transfer" ? "bank" : "cod",
        orderNote: orderData.note,
        total: orderData.payment.total,
        items: orderData.products.map(p => {
          let img = p.image || "";
          if (img && !img.startsWith("http")) {
            img = window.location.origin + (img.startsWith("/") ? "" : "/") + img;
          }
          return {
            name: p.title,
            qty: p.qty,
            price: p.price,
            image: img
          };
        })
      };

      console.log("📧 E-posta gönderilecek data:", emailPayload);

      const res = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });

      const result = await res.json();
      if (result.success) {
        console.log("✅ Sipariş e-postası başarıyla gönderildi");
      } else {
        console.error("❌ E-posta Hatası:", result.error);
        alert("E-POSTA GÖNDERİLEMEDİ: " + result.error);
        toast("Bildirim maili gönderilemedi.");
      }
    } catch (err) {
      console.error("🔥 E-posta Servis Hatası:", err);
      alert("MAİL SERVİSİNE BAĞLANILAMADI: " + err.message);
    }
  }

  /* ==========================
     FIRESTORE SİPARİŞ KAYDET
  ========================== */
  async function saveOrderToFirestore(orderData) {
    // Firebase hazır olana kadar bekle
    let attempts = 0;
    while (!window.firestoreDB && attempts < 20) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!window.firestoreDB) {
      console.error("❌ Firestore DB bulunamadı!");
      return false;
    }

    try {
      const { collection, addDoc, serverTimestamp } =
        await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

      orderData.createdAt = serverTimestamp();
      await addDoc(collection(window.firestoreDB, "orders"), orderData);
      console.log("✅ Sipariş Firestore'a kaydedildi:", orderData.orderNo);
      return true;
    } catch (err) {
      console.error("❌ Firestore kayıt hatası:", err);
      return false;
    }
  }

  /* ==========================
     FORM SUBMIT
  ========================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get fresh totals in case quantity changed on the same page
    const currentTotals = calcTotal();
    const appliedCoupon = window.GKStorage.readCoupon();

    submitBtn.disabled = true;
    submitBtn.textContent = "İşleniyor...";

    const agreeEl = qs("#agree");
    if (agreeEl && !agreeEl.checked) {
      toast("Devam etmek için sözleşmeleri onaylamalısın.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Siparişi Tamamla";
      return;
    }

    const formData = Object.fromEntries(new FormData(form).entries());

    const fullName = String(formData.fullName || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "Müşteri";
    const surname = nameParts.slice(1).join(" ") || firstName;

    const phoneDigits = String(formData.phone || "").replace(/\D/g, "");
    const gsm = phoneDigits ? "+90" + phoneDigits : "";

    // Ödeme yöntemi - Her zaman kapida (CoD)
    const paymentValue = String(formData.payment || "kapida");

    console.log("🔍 Form payment value:", paymentValue);
    console.log("🔍 isCardPayment:", isCardPayment);

    // Sipariş numarası oluştur (PayTR sadece alfanumerik kabul ediyor)
    const orderNo = "GK" + Date.now();

    // Sipariş verisi
    const orderData = {
      orderNo: orderNo,
      customer: {
        name: `${firstName} ${surname}`,
        phone: gsm,
        email: String(formData.email || "").trim()
      },
      delivery: {
        city: String(formData.city || "").trim(),
        district: String(formData.district || "").trim(),
        address: String(formData.address || "").trim(),
        type: "cargo"
      },
      payment: {
        method: paymentValue === "transfer" ? "transfer" : "cash",
        total: currentTotals.totalKurus / 100,
        status: "awaiting"
      },
      note: String(formData.note || "").trim(),
      products: currentTotals.cart.map((i) => ({
        title: i.title,
        qty: Number(i.qty) || 1,
        price: Number(i.price) || 0,
        image: i.image || ""
      }))
    };

    console.log("🔥 Order Payload:", JSON.stringify(orderData, null, 2));

    /* ==========================
       💳 KREDİ KARTI İLE ÖDEME (PAYTR)
    ========================== */

    /* ==========================
       HAVALE/EFT & KAPIDA ÖDEME - MEVCUT AKIŞ
    ========================== */

    const saved = await saveOrderToFirestore(orderData);
    if (!saved) {
      toast("Sipariş kaydedilemedi. Lütfen tekrar deneyin.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Siparişi Tamamla";
      return;
    }

    // Tracking için localStorage'a kaydet
    const trackingData = {
      conversationId: orderNo,
      paidPrice: currentTotals.totalKurus / 100,
      basketItems: currentTotals.cart.map((i) => ({
        id: i.id,
        name: i.title || "Ürün",
        price: Number(i.price) || 0
      }))
    };
    localStorage.setItem("gizlikutu_last_order_v1", JSON.stringify(trackingData));

    // Sepeti ve kuponu temizle (ANTI-ABUSE)
    if (appliedCoupon && appliedCoupon.code) {
      window.GKStorage.markCouponAsUsed(appliedCoupon.code);
      window.GKStorage.writeCoupon(null);
    }
    window.GKStorage.clearCart();

    // E-posta bildirimi gönder (bekleyerek)
    await sendOrderEmail(orderData, currentTotals);

    window.location.href = "./success.html";
  });
})();


