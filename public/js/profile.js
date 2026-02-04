
import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection, query, where, getDocs, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";

const { money, qs } = window.GK || { money: v => v + ' TL', qs: s => document.querySelector(s) };

// Firebase URL'sini local path'e çevirir
function firebaseToLocal(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('firebasestorage.googleapis.com')) {
        try {
            const part = url.split('/o/')[1].split('?')[0];
            const decoded = decodeURIComponent(part);
            return '/assets/' + decoded;
        } catch (e) {
            return url;
        }
    }
    return url;
}

/* =========================================
   1. INIT & AUTH CHECK
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = './index.html';
            return;
        }

        // UI Update
        qs('#userName').textContent = user.displayName || user.email.split('@')[0];
        qs('#userEmail').textContent = user.email;

        // Load Data
        loadOrders(user.uid);
        loadTop5();
        loadHistory();
        loadCartPreview();
        loadCoupons();
    });

    // Logout
    qs('#logoutBtn').addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = './index.html';
    });
});

/* =========================================
   2. LOAD ORDERS
   ========================================= */
async function loadOrders(uid) {
    const container = qs('#ordersList');
    container.innerHTML = '<div style="text-align:center; color:#888;">Yükleniyor...</div>';

    try {
        // Firestore query: orders where userId == uid
        const q = query(
            collection(db, "orders"),
            where("userId", "==", uid),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center; padding: 30px 20px;">
                    <p style="color:#444; font-size:16px; margin-bottom:20px; font-weight:500;">Henüz Hiç Siparişiniz Bulunmamaktadır</p>
                    <a href="./products.html" style="
                        display: inline-block;
                        background: #dc2626; 
                        color: white; 
                        padding: 12px 30px; 
                        border-radius: 12px; 
                        text-decoration: none; 
                        font-weight: bold;
                        box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.4);
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        Hemen Sipariş Ver
                    </a>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.createdAt).toLocaleDateString('tr-TR');
            const statusClass = data.status === 'paid' ? 'paid' : '';
            const statusText = data.status === 'paid' ? 'ÖDEME YAPILDI' : 'ÖDEME BEKLENİYOR';

            // Ürünleri listele
            let productsHtml = '';
            if (data.cartItems && Array.isArray(data.cartItems)) {
                productsHtml = data.cartItems.map(p => `
           <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>${p.quantity}x ${p.title}</span>
              <span>${money(p.price * p.quantity)}</span>
           </div>
         `).join('');
            }

            html += `
        <div class="order-item">
          <div class="order-header">
            <div class="order-id">#${doc.id.slice(0, 8)}...</div>
            <div class="order-date">${date}</div>
          </div>
          <div class="order-status ${statusClass}">${statusText}</div>
          <div class="order-total">${money(data.totalPrice || 0)}</div>
          <div class="order-products">
             ${productsHtml}
          </div>
        </div>
      `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div style="text-align:center; padding: 30px 20px;">
                <p style="color:#444; font-size:16px; margin-bottom:20px; font-weight:500;">Henüz Hiç Siparişiniz Bulunmamaktadır</p>
                <a href="./products.html" style="
                    display: inline-block;
                    background: #dc2626; 
                    color: white; 
                    padding: 12px 30px; 
                    border-radius: 12px; 
                    text-decoration: none; 
                    font-weight: bold;
                    box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.4);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Hemen Sipariş Ver
                </a>
            </div>
        `;
    }
}

/* =========================================
   3. LOAD TOP 5 PRODUCTS
   ========================================= */
async function loadTop5() {
    const container = qs('#top5List');

    try {
        const res = await fetch('./data/products.json');
        const products = await res.json();

        // Rastgele 5 ürün seç (gerçek bir algoritma yerine shuffle)
        const shuffled = products
            .filter(p => p.active && p.price > 100)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        renderProductGrid(container, shuffled);

    } catch (e) {
        container.innerHTML = '';
    }
}

/* =========================================
   4. LOAD VISIT HISTORY
   ========================================= */
async function loadHistory() {
    const container = qs('#historyList');

    // LocalStorage'daki array: ["prod-id-1", "prod-id-2"]
    const historyIds = JSON.parse(localStorage.getItem('gk_viewded_products') || '[]');

    if (historyIds.length === 0) {
        return;
    }

    try {
        const res = await fetch('./data/products.json');
        const allProducts = await res.json();

        // ID'lere göre filtrele
        const historyProducts = historyIds
            .map(id => allProducts.find(p => p.id === id))
            .filter(p => p); // undefined olanları at

        if (historyProducts.length > 0) {
            renderProductGrid(container, historyProducts.slice(0, 10)); // Son 10
        }

    } catch (e) {
        console.error(e);
    }
}

/* =========================================
   HELPER: RENDER GRID
   ========================================= */
function renderProductGrid(container, products) {
    const html = products.map(p => {
        const rawImg = (p.images && p.images[0]) || p.image || './assets/placeholder.jpg';
        const img = firebaseToLocal(rawImg);
        return `
      <a href="./product.html?slug=${p.slug || p.id}" class="p-card">
        <img src="${img}" class="p-img" loading="lazy" alt="${p.title}">
        <div class="p-info">
          <div class="p-title">${p.title}</div>
          <div class="p-price">${money(p.price)}</div>
        </div>
      </a>
    `;
    }).join('');

    container.innerHTML = html;
}

/* =========================================
   5. LOAD CART PREVIEW
   ========================================= */
function loadCartPreview() {
    const list = document.querySelector('#profileCartList');
    const container = document.querySelector('#cartSection');
    const totalEl = document.querySelector('#profileCartTotal');
    const countEl = document.querySelector('#profileCartCount');
    const actions = document.querySelector('#profileCartActions');

    if (!container) return;

    container.style.display = 'block';

    // 1) Sepeti oku (Global Storage veya Direct LS)
    let cart = [];
    if (window.GKStorage && window.GKStorage.readCart) {
        cart = window.GKStorage.readCart();
    } else {
        cart = JSON.parse(localStorage.getItem('gizlikutu_cart_v1') || '[]');
    }

    // 2) Toplam Ürün Sayısını Hesapla (item.qty üzerinden)
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (countEl) countEl.textContent = totalQty;

    // 3) Sepet Boşsa
    if (cart.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding: 20px; color:#666;">
                Sepetinizde ürün bulunmamaktadır.
                <br><br>
                <a href="./products.html" class="btn primary" style="padding:8px 16px; font-size:13px;">Alışverişe Başla</a>
            </div>
        `;
        if (actions) actions.style.display = 'none';
        return;
    }

    if (actions) actions.style.display = 'flex';

    let html = '';
    let total = 0;

    cart.forEach(item => {
        // Miktar (storage.js 'qty' kullanıyor, ama eski için 'quantity' fallback)
        const q = item.qty || item.quantity || 1;
        const itemTotal = item.price * q;
        total += itemTotal;

        let img = './assets/placeholder.jpg';
        if (item.images && item.images.length > 0) img = item.images[0];
        else if (item.image) img = item.image;

        html += `
            <div style="display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid rgba(0,0,0,0.05); position:relative;">
                <a href="./product.html?id=${item.id}" style="display:block; flex-shrink:0;">
                    <img src="${img}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #eee;">
                </a>
                
                <div style="flex:1">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <a href="./product.html?id=${item.id}" style="font-weight:600; font-size:14px; color:#1f2937; line-height:1.2; padding-right:20px; text-decoration:none; flex:1">
                            ${item.title}
                        </a>
                        <button onclick="removeProfileCartItem('${item.id}')" 
                                style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:11px; display:flex; align-items:center; gap:2px; padding:2px 5px; border-radius:4px; flex-shrink:0;">
                            🗑️ Sil
                        </button>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
                            <button onclick="updateProfileCartQty('${item.id}', ${q}, -1)" 
                                    style="width:28px; height:28px; border:none; background:#f9fafb; font-weight:bold; color:#374151; cursor:pointer;">-</button>
                            <span style="width:32px; text-align:center; font-size:13px; font-weight:500;">${q}</span>
                            <button onclick="updateProfileCartQty('${item.id}', ${q}, 1)" 
                                    style="width:28px; height:28px; border:none; background:#f9fafb; font-weight:bold; color:#374151; cursor:pointer;">+</button>
                        </div>

                        <div style="font-weight:700; color:#111827; font-size:15px;">
                            ${money(itemTotal)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    if (totalEl) totalEl.textContent = money(total);
}

// Helper Functions
window.updateProfileCartQty = function (id, currentQty, change) {
    if (!window.GKStorage) return;
    const newQty = currentQty + change;
    if (newQty < 1) return;
    window.GKStorage.updateQty(id, newQty);
    loadCartPreview();
    // Header'daki sepet sayısını güncelle (Live update)
    const event = new Event('storage');
    window.dispatchEvent(event);

    // Header cart badge güncelleme (Basit DOM manipülasyonu)
    const cartCountEl = document.getElementById('cartCount'); // Header'daki element ID'si
    if (cartCountEl && window.GKStorage.cartCount) {
        const count = window.GKStorage.cartCount();
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
};

window.removeProfileCartItem = function (id) {
    if (!window.GKStorage) return;
    if (!confirm('Bu ürünü sepetten silmek istiyor musunuz?')) return;
    window.GKStorage.removeItem(id);
    loadCartPreview();

    // Header cart badge güncelleme
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl && window.GKStorage.cartCount) {
        const count = window.GKStorage.cartCount();
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
};

/* =========================================
   6. LOAD COUPONS (Wallet & Profile)
   ========================================= */
function loadCoupons() {
    const container = document.querySelector('#couponsList');
    if (!container) return;

    if (!window.GKStorage) return;
    const wallet = window.GKStorage.readWallet();

    if (wallet.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 20px; color:#666; background:rgba(0,0,0,0.02); border-radius:12px;">
                Henüz kazanılmış bir kuponunuz bulunmamaktadır. 🎁
            </div>
        `;
        return;
    }

    container.innerHTML = wallet.map(coupon => {
        const isExpired = coupon.expiresAt && Date.now() > coupon.expiresAt;
        const statusText = isExpired ? 'SÜRESİ DOLDU' : (coupon.used ? 'KULLANILDI' : 'AKTİF');
        const statusColor = isExpired ? '#ef4444' : (coupon.used ? '#9ca3af' : '#10b981');

        return `
            <div style="background:white; border: 2px dashed #e5e7eb; border-radius:15px; padding:15px; display:flex; flex-direction:column; gap:10px; position:relative; overflow:hidden;">
                ${coupon.used ? '<div style="position:absolute; inset:0; background:rgba(255,255,255,0.6); z-index:1;"></div>' : ''}
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:800; font-size:18px; color:#be185d;">${coupon.code}</span>
                    <span style="font-size:11px; font-weight:700; color:${statusColor}; border:1px solid ${statusColor}; padding:2px 8px; border-radius:10px;">${statusText}</span>
                </div>
                <div style="font-size:13px; color:#4b5563; font-weight:500;">
                    ${coupon.type === 'percentage' ? `%${coupon.value} İndirim` : 'Ücretsiz Kargo'}
                </div>
                <div style="font-size:11px; color:#9ca3af;">
                    Geçerlilik: ${coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('tr-TR') : 'Sınırsız'}
                </div>
                <div style="display:flex; gap:5px; margin-top:5px;">
                    <button onclick="copyCoupon('${coupon.code}')" 
                            ${coupon.used || isExpired ? 'disabled' : ''}
                            style="flex:1; background:${coupon.used || isExpired ? '#f3f4f6' : '#fff1f2'}; color:${coupon.used || isExpired ? '#9ca3af' : '#be185d'}; border:1px solid ${coupon.used || isExpired ? '#e5e7eb' : '#fb7185'}; padding:8px; border-radius:10px; font-weight:700; cursor:${coupon.used || isExpired ? 'default' : 'pointer'}; font-size:11px;">
                        KODU KOPYALA
                    </button>
                    ${!coupon.used && !isExpired ? `
                        <button onclick="applyCouponToCart('${coupon.code}')" 
                                style="flex:1; background:#be185d; color:white; border:none; padding:8px; border-radius:10px; font-weight:700; cursor:pointer; font-size:11px;">
                            SEPETTE UYGULA
                        </button>
                    ` : `
                        <button disabled style="flex:1; background:#f3f4f6; color:#9ca3af; border:none; padding:8px; border-radius:10px; font-weight:700; font-size:11px;">
                            ${coupon.used ? 'KULLANILDI' : 'SÜRESİ DOLDU'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join("");
}

window.applyCouponToCart = (code) => {
    const wallet = window.GKStorage.readWallet();
    const coupon = wallet.find(c => c.code === code);

    if (!coupon || coupon.used) {
        alert("Bu kupon artık geçersiz.");
        return;
    }

    const now = Date.now();
    if (coupon.expiresAt && now > coupon.expiresAt) {
        alert("Bu kuponun süresi dolmuş.");
        return;
    }

    // Apply to current session
    window.GKStorage.writeCoupon(coupon);

    // Redirect to cart
    window.location.href = './cart.html';
};

window.copyCoupon = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        alert("Kupon kodu kopyalandı: " + code);
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
    });
};

