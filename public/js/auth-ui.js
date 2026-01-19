
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
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
    z-index: 10000; display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: opacity 0.3s;
  }
  .auth-backdrop.active { opacity: 1; pointer-events: all; }

  /* Modal Wrapper */
  .auth-modal {
    width: 90%; max-width: 400px;
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    overflow: hidden;
    transform: scale(0.95); transition: transform 0.3s;
    position: relative;
  }
  .auth-backdrop.active .auth-modal { transform: scale(1); }

  /* Close Button */
  .auth-close {
    position: absolute; top: 15px; right: 15px;
    background: none; border: none; color: #999; font-size: 24px;
    cursor: pointer; z-index: 2;
  }
  .auth-close:hover { color: #fff; }

  /* Tabs */
  .auth-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .auth-tabs.hidden { display: none; } /* Hide tabs for non-tab views like reset pass */
  
  .auth-tab {
    flex: 1; padding: 15px; text-align: center; cursor: pointer;
    font-weight: 600; color: #999;
    background: rgba(255,255,255,0.02);
    transition: all 0.2s;
  }
  .auth-tab.active {
    background: transparent; color: #fff;
    border-bottom: 2px solid #8b5cf6;
  }

  /* Content */
  .auth-content { padding: 25px; display: none; }
  .auth-content.active { display: block; }

  /* Forms */
  .auth-input-group { margin-bottom: 15px; }
  .auth-input {
    width: 100%; padding: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #fff; outline: none;
    font-size: 14px;
  }
  .auth-input:focus { border-color: #8b5cf6; }

  .auth-btn {
    width: 100%; padding: 12px; margin-top: 10px;
    border-radius: 8px; border: none; font-weight: 600; cursor: pointer;
    font-size: 14px; transition: 0.2s;
  }
  .btn-primary { background: linear-gradient(45deg, #8b5cf6, #d946ef); color: #fff; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-secondary { background: rgba(255,255,255,0.1); color: #ccc; }
  .btn-secondary:hover { background: rgba(255,255,255,0.2); }

  .divider { 
    margin: 20px 0; display: flex; align-items: center; 
    color: #666; font-size: 12px; 
  }
  .divider::before, .divider::after {
    content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.1);
  }
  .divider span { padding: 0 10px; }

  /* Social Login */
  .social-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #fff; color: #333; margin-bottom: 10px;
    position: relative;
  }
  .social-btn.facebook { background: #1877F2; color: #fff; }
  .social-btn img { width: 18px; }

  /* Helper Text */
  .auth-helper { font-size: 12px; color: #999; text-align: center; margin-top: 15px; }
  .auth-link { color: #8b5cf6; text-decoration: none; cursor: pointer; }
  .auth-link:hover { text-decoration: underline; }

  .error-msg { 
    color: #ff4d4d; font-size: 12px; margin-bottom: 10px; 
    display: none; background: rgba(255,0,0,0.1); padding: 8px; border-radius: 4px;
  }
  .success-msg {
    color: #4ade80; font-size: 12px; margin-bottom: 10px;
    display: none; background: rgba(74, 222, 128, 0.1); padding: 8px; border-radius: 4px;
  }
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

        <button class="auth-btn social-btn facebook" id="btnFbLogin">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.88c0-2.474 1.276-4.66 4.358-4.66 1.476 0 2.246.11 2.617.159v3.012h-1.796c-1.2 0-1.527.57-1.527 1.405v1.964h3.368l-.427 3.667h-2.941v7.98H9.101z"/></svg>
           Facebook İle Giriş Yap
        </button>
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

        <button class="auth-btn social-btn facebook" id="btnFbSignup">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.88c0-2.474 1.276-4.66 4.358-4.66 1.476 0 2.246.11 2.617.159v3.012h-1.796c-1.2 0-1.527.57-1.527 1.405v1.964h3.368l-.427 3.667h-2.941v7.98H9.101z"/></svg>
           Facebook İle Giriş Yap
        </button>
        <button class="auth-btn social-btn" id="btnGoogleSignup">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
          Google İle Giriş Yap
        </button>
      </div>

      <!-- FORGOT PASSWORD -->
      <div id="auth-reset" class="auth-content">
        <h3 style="color:#fff; margin-bottom:10px; font-size:18px;">Şifre Sıfırlama</h3>
        <p style="color:#999; font-size:13px; margin-bottom:20px;">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        
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
      alert("Hata: " + err.message);
    }
  };

  document.getElementById('btnGoogleLogin').onclick = () => handleSocial(googleProvider);
  document.getElementById('btnGoogleSignup').onclick = () => handleSocial(googleProvider);
  document.getElementById('btnFbLogin').onclick = () => handleSocial(facebookProvider);
  document.getElementById('btnFbSignup').onclick = () => handleSocial(facebookProvider);
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

function updateHeaderUI(user) {
  // Desktop Header Bul
  const nav = document.querySelector('.desktop-header-nav') || document.querySelector('.header-right nav');

  // Varsa eski butonları temizle (tekrar eklenmesin diye)
  document.querySelectorAll('.auth-nav-item').forEach(e => e.remove());

  if (!nav) return; // Header yoksa çık

  if (user) {
    // --- GİRİŞ YAPILMIŞ ---
    const profileLink = document.createElement('a');
    profileLink.className = 'auth-nav-item';
    profileLink.href = './profile.html';
    profileLink.innerHTML = `👤 Profilim`;
    profileLink.style.fontWeight = 'bold';
    profileLink.style.color = '#4ade80'; // Yeşil

    // Blog'dan sonra ekle
    nav.appendChild(profileLink);

  } else {
    // --- GİRİŞ YAPILMAMIŞ ---

    // Üye Ol Butonu
    const signupBtn = document.createElement('a');
    signupBtn.className = 'auth-nav-item';
    signupBtn.href = '#';
    signupBtn.textContent = 'Üye Ol';
    signupBtn.onclick = (e) => { e.preventDefault(); toggleModal(true, 'signup'); };

    // Giriş Yap Butonu
    const loginBtn = document.createElement('a');
    loginBtn.className = 'auth-nav-item';
    loginBtn.href = '#';
    loginBtn.textContent = 'Giriş Yap';
    loginBtn.onclick = (e) => { e.preventDefault(); toggleModal(true, 'login'); };

    // Üye Ol solda, Giriş Yap sağda olacak şekilde ekle
    nav.appendChild(signupBtn);
    nav.appendChild(loginBtn);
  }
}

// Başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}
