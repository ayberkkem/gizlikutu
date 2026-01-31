// 🌹 Valentine's Day Spin-to-Win Wheel v3.5 - PREMIUM EFFECTS 🎰
(function () {
    const STORAGE_KEY = 'gk_wheel_session_v3';
    const CAMPAIGN_ID = 'VALENTINE_2026';

    let isSpinning = false;
    let currentTotalRotation = 0;
    let userSession = { spinCount: 0, locked: false, finalReward: null, couponCode: null };

    // --- Campaign Constants ---
    const CAMPAIGN_END = new Date("2026-02-15T23:59:59").getTime();

    function generateCouponCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No O, 0, I, 1
        let code = "GK-VDAY-";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // --- Sound Assets ---
    const sounds = {
        spin: new Audio('./assets/sounds/spin_tick.mp3'),
        win: new Audio('./assets/sounds/win_chime.mp3')
    };
    sounds.spin.loop = true;
    sounds.spin.volume = 0.3;

    // --- 🔴 16 VISUAL SEGMENTS ---
    const VISUAL_SEGMENTS = [
        { type: "free_shipping", label: "KARGO", color: "#fb7185" },
        { type: "discount", value: 5, label: "%5", color: "#f472b6" },
        { type: "discount", value: 10, label: "%10", color: "#fb7185" },
        { type: "discount", value: 15, label: "%15", color: "#f472b6" },
        { type: "discount", value: 10, label: "%10", color: "#fb7185" },
        { type: "retry", label: "TEKRAR", color: "#e11d48" },
        { type: "free_shipping", label: "KARGO", color: "#fb7185" },
        { type: "discount", value: 5, label: "%5", color: "#f472b6" },
        { type: "discount", value: 10, label: "%10", color: "#fb7185" },
        { type: "discount", value: 15, label: "%15", color: "#f472b6" },
        { type: "discount", value: 20, label: "%20", color: "#be123c" }, // Only winnable via probability
        { type: "discount", value: 10, label: "%10", color: "#f472b6" },
        { type: "free_shipping", label: "KARGO", color: "#fb7185" },
        { type: "discount", value: 5, label: "%5", color: "#f472b6" },
        { type: "discount", value: 10, label: "%10", color: "#fb7185" },
        { type: "tekrardan", label: "TEKRAR", color: "#e11d48" }
    ];

    // 🔴 PROBABILITY LOGIC (LOCKED)
    const PROB_SPIN_1 = [
        { type: "free_shipping", weight: 30, coupon: "SEVGILI_KARGO" },
        { type: "discount", value: 10, weight: 40, coupon: "SEVGILI10" },
        { type: "retry", weight: 30, coupon: "" }
    ];

    const PROB_SPIN_2 = [
        { type: "discount", value: 15, weight: 40, coupon: "SEVGILI15" },
        { type: "discount", value: 20, weight: 20, coupon: "SEVGILI20" },
        { type: "free_shipping", weight: 40, coupon: "SEVGILI_KARGO" }
    ];

    // --- UI Setup ---
    if (document.getElementById('gk-wheel-popup')) return;

    function lockScroll(lock) {
        document.documentElement.style.overflow = lock ? "hidden" : "";
        document.body.style.overflow = lock ? "hidden" : "";
    }

    const popup = document.createElement('div');
    popup.id = 'gk-wheel-popup';
    popup.innerHTML = `
    <link rel="stylesheet" href="./css/wheel-effects.css">
    <canvas id="confetti-canvas" class="confetti-canvas"></canvas>
    <div class="wheel-container" id="wheel-container">
      <button class="wheel-close">&times;</button>
      
      <!-- New Layout Wrapper for Desktop Horizontal -->
      <div class="wheel-layout-wrapper">
        
        <!-- Left Section: The Wheel -->
        <div class="wheel-inner-wrap" id="wheel-inner">
          <div id="celebration-overlay">🎉 TEBRİKLER!</div>
          <div class="wheel-pointer" id="wheel-pointer"></div>
          <canvas id="wheel-canvas" class="wheel-canvas idle-glow"></canvas>
        </div>

        <!-- Right Section: Info & Actions -->
        <div class="wheel-content-area">
          <h2 style="font-weight:900; color:#4c0519; margin-bottom:2px; font-size: 18px;">💘 Sevgililer Günü</h2>
          <p style="color:#9f1239; font-size:10px; margin-bottom: 8px;">Çevir, aşk dolu indirimi kap! ❤️</p>
          
          <button id="spin-btn" class="wheel-button">AŞK ÇARKINI ÇEVİR</button>
          
          <div id="coupon-result" class="coupon-box">
            <h3 id="result-title" style="font-size:14px; color:#e11d48; margin-bottom:4px;">🎉 Tebrikler!</h3>
            <p id="result-desc" style="font-size:11px; color:#4c0519; margin-bottom:8px; font-weight:600;"></p>
            <div class="coupon-code" id="final-code">------</div>
            <div style="display:flex; gap:5px; margin-top:8px;">
              <button id="copy-btn" class="wheel-button" style="margin:0; background:#fff1f2; color:#e11d48; border:1px solid #fb7185; flex:1; font-size:11px; padding:8px;">KOPYALA</button>
              <button id="cart-btn" class="wheel-button" style="margin:0; flex:1; font-size:11px; padding:8px;">SEPETE GİT</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
    document.body.appendChild(popup);

    const canvas = document.getElementById('wheel-canvas');
    const pointer = document.getElementById('wheel-pointer');
    const container = document.getElementById('wheel-container');
    const overlay = document.getElementById('celebration-overlay');
    const spinBtn = document.getElementById('spin-btn');
    const couponBox = document.getElementById('coupon-result');
    const codeEl = document.getElementById('final-code');
    const resDesc = document.getElementById('result-desc');

    // --- Confetti Engine ---
    let confettiActive = false;
    const triggerConfetti = () => {
        const c = document.getElementById('confetti-canvas');
        const ctx = c.getContext('2d');
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        const hearts = [];
        const colors = ['#fb7185', '#e11d48', '#ffffff', '#ffd700'];

        for (let i = 0; i < 50; i++) {
            hearts.push({
                x: Math.random() * c.width,
                y: Math.random() * c.height - c.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * 360
            });
        }

        confettiActive = true;
        const render = () => {
            if (!confettiActive) return;
            ctx.clearRect(0, 0, c.width, c.height);
            hearts.forEach(h => {
                h.y += h.speed;
                h.angle += 1;
                ctx.fillStyle = h.color;
                ctx.beginPath();
                ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2);
                ctx.fill();
                if (h.y > c.height) h.y = -20;
            });
            requestAnimationFrame(render);
        };
        render();
        setTimeout(() => { confettiActive = false; ctx.clearRect(0, 0, c.width, c.height); }, 5000);
    };

    const drawWheel = () => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const innerWrap = document.getElementById('wheel-inner');
        const size = innerWrap.offsetWidth;

        canvas.width = size * window.devicePixelRatio;
        canvas.height = size * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const center = size / 2;
        const radius = size / 2 - 5;
        const sections = VISUAL_SEGMENTS.length; // 16
        const arc = (2 * Math.PI) / sections;

        ctx.clearRect(0, 0, size, size);

        VISUAL_SEGMENTS.forEach((s, i) => {
            const angle = i * arc - (Math.PI / 2);

            ctx.beginPath();
            ctx.fillStyle = s.color;
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, angle, angle + arc);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.max(9, size / 22)}px Inter, sans-serif`;
            ctx.fillText(s.label, radius - 8, 4);
            ctx.restore();
        });

        // Hub
        ctx.beginPath();
        ctx.arc(center, center, size / 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const pickReward = () => {
        const pool = userSession.spinCount === 1 ? PROB_SPIN_2 : PROB_SPIN_1;
        const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;
        for (const r of pool) {
            if (random < r.weight) return r;
            random -= r.weight;
        }
        return pool[0];
    };

    window.openWheel = () => {
        popup.classList.add('active');
        lockScroll(true); // LOCK viewport

        // If already won or has a wheel coupon in wallet, lock the UI
        const wallet = window.GKStorage.readWallet();
        const hasWheelCoupon = wallet.find(c => c.source === "wheel" && !c.used);

        if (userSession.locked || hasWheelCoupon) {
            const code = hasWheelCoupon ? hasWheelCoupon.code : userSession.couponCode;
            const reward = hasWheelCoupon ? (hasWheelCoupon.type === 'percentage' ? `%${hasWheelCoupon.value}` : 'Ücretsiz Kargo') : userSession.finalReward;

            couponBox.classList.add('active');
            codeEl.textContent = code;
            resDesc.innerHTML = `${reward} Kazandın 💘`;
            spinBtn.textContent = "KUPONUN HAZIR 🎁";
            spinBtn.disabled = true;
            spinBtn.style.background = '#10b981';
        }

        setTimeout(drawWheel, 100);
    };

    spinBtn.onclick = () => {
        if (isSpinning || userSession.locked) return;

        // Audio interaction rule
        sounds.spin.play().catch(() => { });

        isSpinning = true;
        spinBtn.disabled = true;
        canvas.classList.remove('idle-glow');
        canvas.classList.add('spinning-glow');

        const reward = pickReward();

        // Find matching VISUAL segments
        const matches = VISUAL_SEGMENTS.map((s, i) => {
            if (s.type === reward.type) {
                if (s.type === "discount") return s.value === reward.value ? i : -1;
                return i;
            }
            if (reward.type === "retry" && (s.type === "retry" || s.type === "tekrardan")) return i;
            return -1;
        }).filter(i => i !== -1);

        const targetIndex = matches[Math.floor(Math.random() * matches.length)];
        const sections = VISUAL_SEGMENTS.length;
        const arcDeg = 360 / sections;
        const extraRots = 10 * 360; // 10 spins for speed
        const sliceMiddleDeg = (targetIndex * arcDeg) + (arcDeg / 2);
        const rotationToTarget = 360 - sliceMiddleDeg;

        currentTotalRotation += extraRots + rotationToTarget;
        canvas.style.transform = `rotate(${currentTotalRotation}deg)`;

        setTimeout(() => {
            isSpinning = false;
            sounds.spin.pause();
            sounds.spin.currentTime = 0;
            pointer.classList.add('spark');

            if (reward.type === 'retry') {
                userSession.spinCount = 1;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
                alert("TEKRAR DENE! ❤️");
                spinBtn.disabled = false;
                spinBtn.textContent = "SON ŞANS! ❤️";
                canvas.classList.add('idle-glow');
                canvas.classList.remove('spinning-glow');
            } else {
                sounds.win.play().catch(() => { });

                const generatedCode = generateCouponCode();
                const couponObj = {
                    code: generatedCode,
                    type: reward.type === 'free_shipping' ? 'free_shipping' : 'percentage',
                    value: reward.value || null,
                    source: "wheel",
                    expiresAt: CAMPAIGN_END,
                    used: false,
                    createdAt: Date.now()
                };

                // Persist to Wallet
                window.GKStorage.addCouponToWallet(couponObj);

                userSession.locked = true;
                userSession.finalReward = VISUAL_SEGMENTS[targetIndex].label;
                userSession.couponCode = generatedCode;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));

                // --- CELEBRATION MOMENT ---
                container.classList.add('celebrate');
                overlay.classList.add('active');
                triggerConfetti();

                setTimeout(() => {
                    overlay.classList.remove('active');
                    container.classList.remove('celebrate');
                    couponBox.classList.add('active');
                    codeEl.textContent = reward.coupon;
                    resDesc.innerHTML = `${userSession.finalReward} Kazandın 💘`;
                    spinBtn.textContent = "KAZANDIN! 🎉";
                    canvas.classList.add('idle-glow');
                    canvas.classList.remove('spinning-glow');
                }, 5000);
            }
        }, 6100);
    };

    popup.onclick = (e) => {
        if (e.target === popup && !isSpinning) {
            popup.classList.remove('active');
            lockScroll(false);
        }
    };

    popup.querySelector('.wheel-close').onclick = (e) => {
        e.stopPropagation();
        if (!isSpinning) {
            popup.classList.remove('active');
            lockScroll(false); // UNLOCK viewport
        }
    };

    document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(codeEl.textContent);
        alert('Kopyalandı! ❤️');
    };

    document.getElementById('cart-btn').onclick = () => {
        window.location.href = './profile.html'; // Go to profile to see the coupon and apply
    };

    // Responsive redraw
    window.addEventListener('resize', drawWheel);

    // Init
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) userSession = JSON.parse(local);

    // Auto-launch trigger (delayed & gated by Age Consent)
    const autoOpen = () => {
        const hasAgeConsent = sessionStorage.getItem('gk_age_ok_v1') === '1';
        const hasPassedLaunchCheck = !localStorage.getItem('gk_wheel_auto_v1');

        if (hasAgeConsent && hasPassedLaunchCheck && !userSession.locked) {
            window.openWheel();
            localStorage.setItem('gk_wheel_auto_v1', '1'); // Only auto-open once per device session
        }
    };

    // Delay auto-open for 3 seconds to avoid landing page jumpiness
    setTimeout(autoOpen, 3000);

})();
