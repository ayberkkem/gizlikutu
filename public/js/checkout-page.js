(function () {
  const { qs, money, toast } = window.GK;

  /* ==========================
     PAYTR CLOUD FUNCTION URL
  ========================== */
  const PAYTR_FUNCTION_URL = "https://us-central1-gizli-kutu.cloudfunctions.net/createPaytrPayment";

  /* ==========================
     TOPLAM HESAPLAMA
  ========================== */
  function calcTotal() {
    const cart = window.GKStorage.readCart();
    const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const elSub = qs("#sumSubtotal");
    const elShip = qs("#sumShipping");
    const elTot = qs("#sumTotal");
    if (elSub) elSub.textContent = money(subtotal);
    if (elShip) elShip.textContent = "500₺+ Kargo Bedava 🚚";
    if (elTot) elTot.textContent = money(total);

    return { subtotal, shipping, total, cart };
  }

  const totals = calcTotal();

  const wrap = qs("#checkoutWrap");
  if (!wrap) return;

  if (totals.cart.length === 0) {
    wrap.innerHTML = `
      <div class="notice">
        Sepetin boş.
        <a href="./products.html" style="text-decoration:underline">Ürünlere git</a>
      </div>`;
    return;
  }

  const form = qs("#checkoutForm");
  const submitBtn = qs("#submitOrder");
  if (!form || !submitBtn) return;

  /* ==========================
     PAYTR IFRAME MODAL (PC & Mobile/PWA Responsive)
  ========================== */
  function showPaytrModal(iframeUrl) {
    // Mobil mi kontrol et
    const isMobile = window.innerWidth <= 768;

    const overlay = document.createElement("div");
    overlay.id = "paytrOverlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${isMobile ? '#fff' : 'rgba(0,0,0,0.85)'};
      z-index: 9999;
      display: flex;
      align-items: ${isMobile ? 'stretch' : 'center'};
      justify-content: center;
      padding: ${isMobile ? '0' : '10px'};
    `;

    const modal = document.createElement("div");
    modal.style.cssText = isMobile ? `
      background: #fff;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    ` : `
      background: #fff;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      height: 90vh;
      max-height: 700px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      padding: ${isMobile ? '14px 16px' : '12px 16px'};
      padding-top: ${isMobile ? 'max(14px, env(safe-area-inset-top))' : '12px'};
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span style="color:#fff;font-weight:600;font-size:${isMobile ? '16px' : '14px'}">💳 Güvenli ÖÖdeme</span>
      <button id="paytrCloseBtn" style="
        width:${isMobile ? '36px' : '28px'};
        height:${isMobile ? '36px' : '28px'};
        border:none;
        background:rgba(255,255,255,0.2);
        border-radius:50%;
        cursor:pointer;
        color:#fff;
        font-size:${isMobile ? '20px' : '16px'};
        display:flex;
        align-items:center;
        justify-content:center;
      ">✕</button>
    `;

    const iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.style.cssText = `
      width: 100%;
      height: calc(100% - ${isMobile ? '52px' : '48px'});
      border: none;
      background: #fff;
    `;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "yes");
    iframe.setAttribute("allow", "payment");

    modal.appendChild(header);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Body scroll'u kapat (mobilde önemli)
    document.body.style.overflow = 'hidden';

    // Kapatma butonu
    document.getElementById("paytrCloseBtn").onclick = () => {
      if (confirm("ÖÖdemeyi iptal etmek istediğinize emin misiniz?")) {
        overlay.remove();
        document.body.style.overflow = '';
        submitBtn.disabled = false;
        submitBtn.textContent = "Siparişşi Tamamla";
      }
    };

    console.log("✅ PayTR modal açıldı (", isMobile ? "Mobile/PWA" : "PC", ")");
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
      console.log("✅ Siparişş Firestore'a kaydedildi:", orderData.orderNo);
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

    submitBtn.disabled = true;
    submitBtn.textContent = "İşleniyor...";

    const agreeEl = qs("#agree");
    if (agreeEl && !agreeEl.checked) {
      toast("Devam etmek için sözleşmeleri onaylamalısın.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Siparişşi Tamamla";
      return;
    }

    const formData = Object.fromEntries(new FormData(form).entries());

    const fullName = String(formData.fullName || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "Müşteri";
    const surname = nameParts.slice(1).join(" ") || firstName;

    const phoneDigits = String(formData.phone || "").replace(/\D/g, "");
    const gsm = phoneDigits ? "+90" + phoneDigits : "";

    // ÖÖdeme yöntemi kontrolü - value="card" HTML'den
    const paymentValue = String(formData.payment || "card");
    const isCardPayment = paymentValue === "card";

    console.log("🔍 Form payment value:", paymentValue);
    console.log("🔍 isCardPayment:", isCardPayment);

    // Siparişş numarası oluştur (PayTR sadece alfanumerik kabul ediyor)
    const orderNo = "GK" + Date.now();

    // Siparişş verisi
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
        method: isCardPayment ? "online" : (paymentValue === "transfer" ? "transfer" : "cash"),
        total: totals.total,
        status: isCardPayment ? "pending" : "awaiting"
      },
      note: String(formData.note || "").trim(),
      products: totals.cart.map((i) => ({
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
    if (isCardPayment) {
      submitBtn.textContent = "ÖÖdeme hazırlanıyor...";

      // Önce siparişi Firestore'a kaydet
      const saved = await saveOrderToFirestore(orderData);
      if (!saved) {
        toast("Siparişş kaydedilemedi. Lütfen tekrar deneyin.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Siparişşi Tamamla";
        return;
      }

      // PayTR token al
      submitBtn.textContent = "PayTR'ye bağlanılıyor...";

      try {
        const paytrPayload = {
          orderNo: orderNo,
          email: orderData.customer.email || "musteri@gizlikutu.online",
          totalAmount: totals.total,
          userName: `${firstName} ${surname}`,
          userPhone: gsm || "05000000000",
          userAddress: `${orderData.delivery.address}, ${orderData.delivery.district}, ${orderData.delivery.city}`,
          userCity: orderData.delivery.city || "Istanbul",
          basketItems: totals.cart.map((i) => ({
            name: i.title || "Ürün",
            price: Number(i.price) || 0,
            qty: Number(i.qty) || 1
          }))
        };

        const res = await fetch(PAYTR_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paytrPayload)
        });

        const data = await res.json();

        if (data.success && data.iframeUrl) {
          // Tracking için localStorage'a kaydet (success.html'de kullanılacak)
          const trackingData = {
            conversationId: orderNo,
            paidPrice: totals.total,
            basketItems: totals.cart.map((i) => ({
              id: i.id,
              name: i.title || "Ürün",
              price: Number(i.price) || 0
            }))
          };
          localStorage.setItem("gizlikutu_last_order_v1", JSON.stringify(trackingData));

          // Sepeti temizle
          window.GKStorage.clearCart();

          // PayTR öÖdeme ekranını aç
          showPaytrModal(data.iframeUrl);

          // RETURN - success.html'e gitme!
          return;
        } else {
          throw new Error(data.error || "ÖÖdeme sistemi yanıt vermedi");
        }
      } catch (err) {
        toast("ÖÖdeme başlatılamadı: " + (err.message || "Bilinmeyen hata. Lütfen tekrar deneyin."));
        submitBtn.disabled = false;
        submitBtn.textContent = "Siparişşi Tamamla";
        return;
      }
    }

    /* ==========================
       HAVALE/EFT & KAPIDA ÖDEME - MEVCUT AKIŞ
    ========================== */

    const saved = await saveOrderToFirestore(orderData);
    if (!saved) {
      toast("Siparişş kaydedilemedi. Lütfen tekrar deneyin.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Siparişşi Tamamla";
      return;
    }

    // Tracking için localStorage'a kaydet
    const trackingData = {
      conversationId: orderNo,
      paidPrice: totals.total,
      basketItems: totals.cart.map((i) => ({
        id: i.id,
        name: i.title || "Ürün",
        price: Number(i.price) || 0
      }))
    };
    localStorage.setItem("gizlikutu_last_order_v1", JSON.stringify(trackingData));

    // Sepeti temizle ve başarı sayfasına yönlendir
    window.GKStorage.clearCart();
    window.location.href = "./success.html";
  });
})();
