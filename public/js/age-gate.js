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
    wrap.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.95);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:2147483647; /* Maksimum z-index */
      backdrop-filter: blur(5px);
    `;

    wrap.innerHTML = `
      <div style="
        background:#fff !important;
        max-width:380px;
        width:90% !important;
        padding:30px 20px !important;
        border-radius:16px !important;
        text-align:center !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
        position: relative !important;
        z-index: 2147483647 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
      ">
        <h2 style="margin:0 0 15px; color:#111; font-weight:800; font-size:22px;">🔞 18+ Uyarısı</h2>

        <p style="font-size:15px;color:#444;margin-bottom:24px; line-height:1.5;">
          Bu site yalnızca <b>18 yaş ve üzeri</b> yetişkinler içindir.<br>
          İçerikleri görüntülemek için yaşınızı doğrulayın.
        </p>

        <div class="row" style="display:flex; justify-content:center; gap:12px">
          <button class="btn primary" id="ageYes" style="background:#e11d48; color:white; border:none; padding:12px 24px; border-radius:8px; font-weight:700; cursor:pointer; font-size:15px; box-shadow:0 4px 10px rgba(225,29,72,0.4);">Evet, 18+</button>
          <a class="btn" href="https://www.google.com" style="background:#f3f4f6; color:#374151; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">Çıkış</a>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    document.getElementById("ageYes").addEventListener("click", () => {
      setConsent();
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
