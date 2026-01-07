(function () {
  const KEY = "gk_age_ok_v1";

  function hasConsent() {
    return localStorage.getItem(KEY) === "1";
  }

  function setConsent() {
    localStorage.setItem(KEY, "1");
  }

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function createGate() {
    const wrap = document.createElement("div");
    wrap.id = "ageGate";
    wrap.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.75);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
    `;

    wrap.innerHTML = `
      <div style="
        background:#fff;
        max-width:420px;
        width:90%;
        padding:24px;
        border-radius:16px;
        text-align:center;
      ">
        <h2 style="margin:0 0 10px">18+ Uyarısı</h2>

        <p style="font-size:14px;color:#555;margin-bottom:18px">
          Bu site yalnızca <b>18 yaş ve üzeri</b> kullanıcılar içindir.
          Devam ederek 18 yaşından büyük olduğunuzu kabul etmiş olursunuz.
        </p>

        <div class="row" style="justify-content:center;gap:10px">
          <button class="btn primary" id="ageYes">Evet, 18+</button>
          <a class="btn" href="https://www.google.com">Hayır</a>
        </div>

        <p style="font-size:12px;color:#999;margin-top:12px">
          Bu onay yalnızca cihazınızda saklanır.
        </p>
      </div>
    `;

    document.body.appendChild(wrap);

    document.getElementById("ageYes").addEventListener("click", () => {
      setConsent();
      wrap.remove();
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
