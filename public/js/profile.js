
import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection, query, where, getDocs, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";

const { money, qs } = window.GK || { money: v => v + ' TL', qs: s => document.querySelector(s) };

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
                    <p style="color:#444; font-size:16px; margin-bottom:20px; font-weight:500;">Henüz Hiç Siparişşiniz Bulunmamaktadır</p>
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
                        Hemen Siparişş Ver
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
                <p style="color:#444; font-size:16px; margin-bottom:20px; font-weight:500;">Henüz Hiç Siparişşiniz Bulunmamaktadır</p>
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
                    Hemen Siparişş Ver
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
        const img = (p.images && p.images[0]) || p.image || './assets/placeholder.jpg';
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

        // Görsel Seçimi (storage.js mantığına benzer, ama item içinde zaten image string olabilir)
        // item.images array veya item.image string
        let img = './assets/placeholder.jpg';
        if (item.images && item.images.length > 0) img = item.images[0];
        else if (item.image) img = item.image;

        html += `
            <div style="display:flex; align-items:center; gap:15px; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
                <img src="${img}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #ddd;">
                <div style="flex:1">
                    <div style="font-weight:500; font-size:14px; color:#333; margin-bottom:2px">${item.title}</div>
                    <div style="font-size:12px; color:#666;">${q} adet x ${money(item.price)}</div>
                </div>
                <div style="font-weight:bold; color:#333; font-size:14px;">
                    ${money(itemTotal)}
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    if (totalEl) totalEl.textContent = money(total);
}
