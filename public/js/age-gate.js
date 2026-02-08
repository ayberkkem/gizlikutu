(function () {
  const KEY = "gk_age_ok_v1";

  // sessionStorage kullanarak her yeni tarayıcı oturumunda (ilk girişte) sor
  function hasConsent() {
    return sessionStorage.getItem(KEY) === "1";
  }

  function setConsent() {
    sessionStorage.setItem(KEY, "1");
  }

  function lockScroll(lock) {
    // document.documentElement.style.overflow = lock ? "hidden" : "";
    // document.body.style.overflow = lock ? "hidden" : "";
    // Kilitlenme sorununu çözmek için scroll engellemeyi kaldırıyoruz!
  }

  function createGate() {
    const wrap = document.createElement("div");
    wrap.id = "ageGate";
    wrap.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.9); /* Daha koyu arka plan */
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:2147483647; /* Maksimum z-index - Her şeyin üstünde */
    `;

    wrap.innerHTML = `
      <div style="
        background:#fff;
        max-width:380px;
        width:90%;
        padding:30px 20px;
        border-radius:16px;
        text-align:center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        position: relative;
        z-index: 2147483647;
      ">
        <h2 style="margin:0 0 15px; color:#111; font-weight:800; font-size:22px;">🔞 18+ Uyarısı</h2>

        <p style="font-size:15px;color:#444;margin-bottom:24px; line-height:1.5;">
          Bu site yalnızca <b>18 yaş ve üzeri</b> yetişkinler içindir.<br>
          İçerikleri görüntülemek için yaşınızı doğrulayın.
        </p>

        <div class="row" style="display:flex; justify-content:center; gap:12px">
          <button class="btn primary" id="ageYes" style="background:#e11d48; color:white; border:none; padding:12px 24px; border-radius:8px; font-weight:700; cursor:pointer; font-size:15px;">Evet, 18+</button>
          <a class="btn" href="https://www.google.com" style="background:#f3f4f6; color:#374151; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">Çıkış</a>
        </div>

        <p style="font-size:11px;color:#9ca3af;margin-top:20px">
          Bu onay yalnızca cihazınızda saklanır.
        </p>
      </div>
    `;

    document.body.appendChild(wrap);

    document.getElementById("ageYes").addEventListener("click", () => {
      setConsent();
      // wrap.remove() yerine display:none yapalım (daha güvenli)
      wrap.style.display = 'none';
      lockScroll(false);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!hasConsent()) {
      lockScroll(true);
      createGate();
    }
  });
})();
