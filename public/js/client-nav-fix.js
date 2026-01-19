// Bu script, HTML ne olursa olsun Client tarafında menüyü zorla düzeltir.
document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector('.desktop-header-nav');
    if (nav) {
        // Mevcut içeriği sakla (Eğer auth butonları varsa kaybolmasın diye)
        // Ama auth butonları zaten auth-ui.js ile sonradan ekleniyor.
        // O yüzden korkmadan silebilirim.

        nav.innerHTML = `
          <a href="./index.html">Anasayfa</a>
          <a href="./products.html">Popüler Ürünler</a>
          <a href="./cities.html">Hizmet Bölgelerimiz</a>
          <a href="./blog.html">Blog</a>
        `;

        // CSS ile de aralarını açalım
        nav.style.display = 'flex';
        nav.style.gap = '15px';
        nav.style.alignItems = 'center';
    }
});
