(function () {
  const { qs, money, toast } = window.GK;

  /* ==========================
     TOPLAM HESAPLAMA
  ========================== */
  function calcTotal() {
    const cart = window.GKStorage.readCart();
    const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const shipping = subtotal > 0 ? 79 : 0;
    const total = subtotal + shipping;

    // Sayfada bu alanlar yoksa patlamasın
    const elSub = qs("#sumSubtotal");
    const elShip = qs("#sumShipping");
    const elTot = qs("#sumTotal");
    if (elSub) elSub.textContent = money(subtotal);
    if (elShip) elShip.textContent = money(shipping);
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

    /* ==========================
       IYZICO READY PAYLOAD
    ========================== */
    const payload = {
      conversationId: "GK_" + Date.now(),
      locale: "tr",
      price: totals.subtotal.toFixed(2),
      paidPrice: totals.total.toFixed(2),
      currency: "TRY",

      buyer: {
        name: firstName,
        surname: surname,
        email: String(formData.email || "").trim(),
        gsmNumber: gsm
      },

      shippingAddress: {
        city: String(formData.city || "").trim(),
        district: String(formData.district || "").trim(),
        address: String(formData.address || "").trim(),
        country: "Turkey",
        zipCode: String(formData.zip || "00000").trim() || "00000"
      },

      billingAddress: {
        city: String(formData.city || "").trim(),
        district: String(formData.district || "").trim(),
        address: String(formData.address || "").trim(),
        country: "Turkey",
        zipCode: String(formData.zip || "00000").trim() || "00000"
      },

      basketItems: totals.cart.map((i) => ({
        id: i.id,
        name: i.title,
        category1: i.category || "Genel",
        itemType: "PHYSICAL",
        price: ((Number(i.price) || 0) * (Number(i.qty) || 0)).toFixed(2)
      })),

      createdAt: new Date().toISOString()
    };

    /* ==========================
       🔮 CANLI ÖDEME (BACKEND)
       ŞİMDİLİK KAPALI
    ========================== */
    /*
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error();
    } catch {
      toast("Ödeme sırasında bir hata oluştu.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Siparişi Tamamla";
      return;
    }
    */

    /* ==========================
       DEMO / SİMÜLASYON
    ========================== */
    localStorage.setItem("gizlikutu_last_order_v1", JSON.stringify(payload));

    window.GKStorage.clearCart();
    window.location.href = "./success.html";
  });
})();
