
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db, googleProvider, facebookProvider } from "./firebase.js";

/* =========================================
   1. AUTH MODAL INJECTION & STYLES
   ========================================= */
const AUTH_STYLES = `
  /* Modal Backdrop */
  .auth-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); /* Daha hafif backdrop */
    z-index: 1000000; /* Age Gate (99999) üstünde olmalı */
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: opacity 0.2s;
  }
  .auth-backdrop.active { opacity: 1; pointer-events: all; }

  /* Modal Wrapper - GUARANTEED VISIBILITY */
  .auth-modal {
    width: 85%; max-width: 320px;
    min-height: 350px; /* İçerik olmasa bile kutu görünsün */
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    overflow: hidden;
    position: relative;
    color: #333;
    opacity: 1 !important; visibility: visible !important;
  }
  .auth-backdrop.active .auth-modal {
    /* Scale animasyonu kaldırıldı, basitlik esas */
  }

  /* Close Button */
  .auth-close {
    position: absolute; top: 10px; right: 15px;
    background: none; border: none; color: #999; font-size: 24px;
    cursor: pointer; z-index: 10; line-height: 1;
  }
  .auth-close:hover { color: #333; }

  /* Tabs */
  .auth-tabs { display: flex; border-bottom: 1px solid #f0f0f0; background: #fafafa; padding-top: 5px; }
  .auth-tabs.hidden { display: none; }
  
  .auth-tab {
    flex: 1; padding: 12px; text-align: center; cursor: pointer;
    font-weight: 600; font-size: 13px; color: #888;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
  }
  .auth-tab.active {
    background: #fff; color: #8b5cf6;
    border-bottom: 2px solid #8b5cf6;
  }

  /* Content */
  .auth-content { padding: 20px; display: none; } /* Padding azaltıldı */
  .auth-content.active { display: block; }

  /* Forms */
  .auth-input-group { margin-bottom: 12px; }
  .auth-input {
    width: 100%; padding: 10px 12px; /* Input küçültüldü */
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 6px; color: #111; outline: none;
    font-size: 13px; transition: border-color 0.2s;
  }
  .auth-input:focus { border-color: #8b5cf6; background: #fff; }

  .auth-btn {
    width: 100%; padding: 10px; margin-top: 8px; /* Buton küçültüldü */
    border-radius: 6px; border: none; font-weight: 600; cursor: pointer;
    font-size: 13px; transition: 0.2s;
  }
  .btn-primary { 
    background: #8b5cf6; color: #fff; 
    box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);
  }
  .btn-primary:hover { background: #7c3aed; }
  
  .btn-secondary { background: #f3f4f6; color: #333; }
  .btn-secondary:hover { background: #e5e7eb; }

  .divider { 
    margin: 15px 0; display: flex; align-items: center; 
    color: #bbb; font-size: 11px; font-weight: 500;
  }
  .divider::before, .divider::after {
    content: ""; flex: 1; height: 1px; background: #f0f0f0;
  }
  .divider span { padding: 0 10px; }

  /* Social Login */
  .social-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #fff; color: #444; margin-bottom: 10px;
    border: 1px solid #eee; padding: 10px;
    font-size: 12px;
  }
  .social-btn:hover { background: #fafafa; }
  .social-btn img { width: 16px; }

  /* Helper Text */
  .auth-helper { font-size: 11px; color: #777; text-align: center; margin-top: 10px; }
  .auth-link { color: #8b5cf6; text-decoration: none; cursor: pointer; font-weight: 500; font-size: 11px; }
  .auth-link:hover { text-decoration: underline; }

  .error-msg { 
    color: #dc2626; font-size: 12px; margin-bottom: 10px; 
    display: none; background: #fef2f2; padding: 8px; border-radius: 4px;
    border: 1px solid #fee2e2;
  }
  .success-msg {
    color: #16a34a; font-size: 12px; margin-bottom: 10px;
    display: none; background: #f0fdf4; padding: 8px; border-radius: 4px;
    border: 1px solid #dcfce7;
  }
  
  /* Reset Password Title */
  .auth-title { color: #111; font-size: 16px; font-weight: bold; margin-bottom: 5px; }
  .auth-desc { color: #666; font-size: 13px; margin-bottom: 15px; line-height: 1.4; }
`;

const AUTH_HTML = `
  <div class="auth-backdrop" id="authBackdrop">
    <div class="auth-modal">
      <button class="auth-close" id="authClose">×</button>
      
      <div class="auth-tabs" id="authTabs">
        <div class="auth-tab active" data-target="login">Giriş Yap</div>
        <div class="auth-tab" data-target="signup">Üye Ol</div>
      </div>

      <!-- LOGIN -->
      <div id="auth-login" class="auth-content active">
        <div class="error-msg" id="loginError"></div>
        
        <form id="loginForm">
          <div class="auth-input-group">
            <input type="email" class="auth-input" placeholder="E-posta Adresi" required>
          </div>
          <div class="auth-input-group">
            <input type="password" class="auth-input" placeholder="Şifre" required>
          </div>
          <div style="text-align:right; margin-bottom:10px;">
            <a class="auth-link" style="font-size:12px;" id="forgotPassLink">Şifremi Unuttum</a>
          </div>
          <button type="submit" class="auth-btn btn-primary">Giriş Yap</button>
        </form>

        <div class="divider"><span>VEYA</span></div>

        <button class="auth-btn social-btn" id="btnGoogleLogin">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
          Google İle Giriş Yap
        </button>
      </div>

      <!-- SIGN UP -->
      <div id="auth-signup" class="auth-content">
        <div class="error-msg" id="signupError"></div>
        
        <form id="signupForm">
          <div class="auth-input-group">
            <input type="text" id="suName" class="auth-input" placeholder="Ad Soyad" required>
          </div>
          <div class="auth-input-group">
            <input type="tel" id="suPhone" class="auth-input" placeholder="Telefon Numarası" required>
          </div>
          <div class="auth-input-group">
            <input type="email" id="suEmail" class="auth-input" placeholder="E-posta Adresi" required>
          </div>
          <div class="auth-input-group">
            <input type="password" id="suPass" class="auth-input" placeholder="Şifre (En az 6 karakter, 1 büyük harf)" required>
          </div>
          <button type="submit" class="auth-btn btn-primary">Üye Ol</button>
        </form>

        <div class="divider"><span>VEYA</span></div>

        <button class="auth-btn social-btn" id="btnGoogleSignup">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
          Google İle Giriş Yap
        </button>
      </div>

      <!-- FORGOT PASSWORD -->
      <div id="auth-reset" class="auth-content">
        <h3 class="auth-title">Şifre Sıfırlama</h3>
        <p class="auth-desc">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        
        <div class="error-msg" id="resetError"></div>
        <div class="success-msg" id="resetSuccess"></div>

        <form id="resetForm">
          <div class="auth-input-group">
            <input type="email" id="resetEmail" class="auth-input" placeholder="E-posta Adresi" required>
          </div>
          <button type="submit" class="auth-btn btn-primary">Sıfırlama Linki Gönder</button>
          <button type="button" class="auth-btn btn-secondary" id="backToLogin">Geri Dön</button>
        </form>
      </div>

    </div>
  </div>
`;

/* =========================================
   2. INITIALIZATION & HELPERS
   ========================================= */

function initAuthUI() {
  // Inject CSS
  const styleSheet = document.createElement("style");
  styleSheet.textContent = AUTH_STYLES;
  document.head.appendChild(styleSheet);

  // Inject HTML
  document.body.insertAdjacentHTML("beforeend", AUTH_HTML);
  bindEvents();
  checkAuthState();
}

function toggleModal(show, view = 'login') {
  const backdrop = document.getElementById('authBackdrop');
  if (show) {
    backdrop.classList.add('active');
    switchView(view);
  } else {
    backdrop.classList.remove('active');
  }
}

function switchView(target) {
  // Hide all content
  document.querySelectorAll('.auth-content').forEach(c => c.classList.remove('active'));

  // Show target content
  const content = document.getElementById(`auth-${target}`);
  if (content) content.classList.add('active');

  // Handle Tabs Visibility
  const tabs = document.getElementById('authTabs');
  if (target === 'reset') {
    tabs.classList.add('hidden');
  } else {
    tabs.classList.remove('hidden');
    // Update active tab
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.auth-tab[data-target="${target}"]`);
    if (tab) tab.classList.add('active');
  }

  // Clear errors
  document.querySelectorAll('.error-msg').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.success-msg').forEach(e => e.style.display = 'none');
}

function showMsg(target, msg, type = 'error') {
  const el = document.getElementById(target + (type === 'error' ? 'Error' : 'Success'));
  el.textContent = msg;
  el.style.display = 'block';
  if (type === 'success') {
    // Hide error just in case
    const errEl = document.getElementById(target + 'Error');
    if (errEl) errEl.style.display = 'none';
  }
}

/* =========================================
   3. EVENT BINDING
   ========================================= */

function bindEvents() {
  // Close Modal
  document.getElementById('authClose').onclick = () => toggleModal(false);
  document.getElementById('authBackdrop').onclick = (e) => {
    if (e.target === document.getElementById('authBackdrop')) toggleModal(false);
  };

  // Switch Tabs (Login/Signup)
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.onclick = () => switchView(tab.dataset.target);
  });

  // Forgot Password Link
  document.getElementById('forgotPassLink').onclick = () => switchView('reset');

  // Back to Login Link
  document.getElementById('backToLogin').onclick = () => switchView('login');


  // --- LOGIN FORM ---
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const pass = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toggleModal(false);
      window.location.reload();
    } catch (err) {
      showMsg('login', 'Giriş yapılamadı: ' + err.message);
    }
  };

  // --- SIGNUP FORM ---
  document.getElementById('signupForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('suName').value;
    const phone = document.getElementById('suPhone').value;
    const email = document.getElementById('suEmail').value;
    const pass = document.getElementById('suPass').value;

    // Validation
    if (pass.length < 6) return showMsg('signup', 'Şifre en az 6 karakter olmalı.');
    if (!/[A-Z]/.test(pass)) return showMsg('signup', 'Şifre en az 1 büyük harf içermeli.');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // Update Profile
      await updateProfile(user, { displayName: name });

      // Save additional data
      await setDoc(doc(db, "users", user.uid), {
        firstName: name,
        email: email,
        phone: phone,
        createdAt: new Date().toISOString()
      });

      toggleModal(false);
      window.location.reload();
    } catch (err) {
      showMsg('signup', 'Kayıt olunamadı: ' + err.message);
    }
  };

  // --- RESET PASSWORD FORM ---
  document.getElementById('resetForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    try {
      await sendPasswordResetEmail(auth, email);
      showMsg('reset', 'Şifre sıfırlama linki e-posta adresinize gönderildi.', 'success');
    } catch (err) {
      showMsg('reset', 'Hata: ' + err.message);
    }
  };


  // --- SOCIAL LOGIN ---
  const handleSocial = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);

      // Eğer yeni kullanıcıysa, DB'ye kaydetmeye çalış (opsiyonel, user.uid ile overwrite etmez)
      // Ancak displayName vs provider'dan gelir.
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        firstName: user.displayName || 'Kullanıcı',
        email: user.email,
        // Phone provider'dan gelmeyebilir, boş bırakabiliriz
        lastLogin: new Date().toISOString()
      }, { merge: true });

      toggleModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Auth Error:", err);
      let msg = "Giriş hatası: " + err.message;

      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        msg = "Google girişi henüz aktif edilmemiştir. Lütfen şimdilik E-posta ile üye olunuz.";
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = "Bu alan adı (gizlikutu.online) henüz yetkilendirilmemiş. Lütfen yönetici panelinden domain ekleyin.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      alert(msg);
    }
  };

  document.getElementById('btnGoogleLogin').onclick = () => handleSocial(googleProvider);
  document.getElementById('btnGoogleSignup').onclick = () => handleSocial(googleProvider);
}

/* =========================================
   4. AUTH STATE & HEADER UI
   ========================================= */
function checkAuthState() {
  onAuthStateChanged(auth, async (user) => {
    updateHeaderUI(user);

    // Eğer profil sayfasındaysak ve user yoksa anasayfaya at
    if (!user && window.location.pathname.includes('profile.html')) {
      window.location.href = './index.html';
    }
  });
}

// Global Access Helper
window.toggleAuthModal = (show = true, view = 'login') => toggleModal(show, view);

function updateHeaderUI(user) {
  // 1. Masaüstü Header Yönetimi
  const nav = document.querySelector('.desktop-header-nav') || document.querySelector('.header-right nav');
  document.querySelectorAll('.auth-nav-item').forEach(e => e.remove()); // Eski balonları temizle

  if (nav) {
    if (user) {
      // --- GİRİŞ YAPILMIŞ ---
      const profileLink = document.createElement('a');
      profileLink.className = 'auth-nav-item auth-btn-desktop';
      profileLink.href = './profile.html';
      profileLink.innerHTML = `👤 Profilim`;
      profileLink.style.fontWeight = 'bold';
      profileLink.style.color = '#4ade80'; // Yeşil
      nav.appendChild(profileLink);
    } else {
      // --- GİRİŞ YAPILMAMIŞ ---
      const signupBtn = document.createElement('a');
      signupBtn.className = 'auth-nav-item auth-btn-desktop';
      signupBtn.href = '#';
      signupBtn.textContent = 'Üye Ol';
      signupBtn.onclick = (e) => { e.preventDefault(); toggleModal(true, 'signup'); };

      const loginBtn = document.createElement('a');
      loginBtn.className = 'auth-nav-item auth-btn-desktop';
      loginBtn.href = '#';
      loginBtn.textContent = 'Giriş Yap';
      loginBtn.onclick = (e) => { e.preventDefault(); toggleModal(true, 'login'); };

      nav.appendChild(signupBtn);
      nav.appendChild(loginBtn);
    }
  }

  // 2. Mobil Header İkon Yönetimi (Yeni Eklenen İkon)
  const profileIcon = document.querySelector('.iconbtn.profileBtn');
  if (profileIcon) {
    if (user) {
      // Login -> Profil Sayfasına Git + Yeşil Yap
      profileIcon.onclick = () => { window.location.href = './profile.html'; };
      profileIcon.style.color = '#4ade80'; // Yeşil (Aktif)
      const svgPath = profileIcon.querySelector('path');
      const svgCircle = profileIcon.querySelector('circle');
      if (svgPath) svgPath.style.stroke = '#4ade80';
      if (svgCircle) svgCircle.style.stroke = '#4ade80';

      profileIcon.setAttribute('aria-label', 'Profilim (' + (user.displayName || '') + ')');
    } else {
      // Logout -> Modal Aç
      profileIcon.onclick = (e) => { e.preventDefault(); toggleModal(true, 'login'); };
      profileIcon.style.color = ''; // Varsayılan renk
      const svgPath = profileIcon.querySelector('path');
      const svgCircle = profileIcon.querySelector('circle');
      if (svgPath) svgPath.style.stroke = 'currentColor';
      if (svgCircle) svgCircle.style.stroke = 'currentColor';

      profileIcon.setAttribute('aria-label', 'Giriş Yap / Üye Ol');
    }
  }

  // 3. Mobil Drawer Yönetimi
  const drawerBtn = document.getElementById('drawerAuthBtn');
  if (drawerBtn) {
    drawerBtn.innerHTML = ''; // Temizle

    if (user) {
      // Giriş Yapmış Kullanıcı -> Profil Linki (Full Width Buton)
      const btn = document.createElement('a');
      btn.href = './profile.html';
      btn.className = 'btn btn-primary btn-block';
      btn.innerHTML = `👤 Hesabım (${user.displayName || 'Profil'})`;
      btn.style.width = '100%';
      btn.style.display = 'block';
      btn.style.textAlign = 'center';
      btn.style.padding = '10px';
      btn.style.borderRadius = '8px';
      btn.style.background = '#8b5cf6'; // Mor Theme
      btn.style.color = 'white';
      btn.style.textDecoration = 'none';
      btn.style.fontWeight = 'bold';
      drawerBtn.appendChild(btn);
    } else {
      // Giriş Yapmamış -> Giriş Yap / Üye Ol Butonları (Yan Yana)
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '10px';

      const login = document.createElement('button');
      login.textContent = 'Giriş Yap';
      login.className = 'btn btn-outline-primary';
      login.style.flex = '1';
      login.style.padding = '10px';
      login.style.borderRadius = '8px';
      login.style.border = '1px solid #8b5cf6';
      login.style.background = 'white';
      login.style.color = '#8b5cf6';
      login.style.cursor = 'pointer';
      login.style.fontWeight = 'bold';
      login.onclick = () => toggleModal(true, 'login');

      const signup = document.createElement('button');
      signup.textContent = 'Üye Ol';
      signup.className = 'btn btn-primary';
      signup.style.flex = '1';
      signup.style.padding = '10px';
      signup.style.borderRadius = '8px';
      signup.style.background = '#8b5cf6';
      signup.style.color = 'white';
      signup.style.border = 'none';
      signup.style.cursor = 'pointer';
      signup.style.fontWeight = 'bold';
      signup.onclick = () => toggleModal(true, 'signup');

      wrap.appendChild(login);
      wrap.appendChild(signup);
      drawerBtn.appendChild(wrap);
    }
  }
}

// Başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}

// Global Access Helper (Module Loaded Check)
window.toggleAuthModal = (show = true, view = 'login') => toggleModal(show, view);
console.log('✅ Auth UI Module Loaded & Ready');
