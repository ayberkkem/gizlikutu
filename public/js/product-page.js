(async function () {
  const { qs, money, toast, setCartBadge } = window.GK;

  const CATEGORY_LABELS = {
    "kadinlara-ozel-vibratorler": "Kadınlara Özel Vibratörler",
    "masaj-ve-uyarici-urunler": "Masaj & Uyarıcı Ürünler",
    "kayganlastiricilar-su-bazli": "Kayganlaştırıcılar (Su Bazlı)",
    "titresimli-oyuncaklar-guclu-vibratorler": "Titreşimli Oyuncaklar & Güçlü Vibratörler",
    "cesur-urunler": "Cesur Ürünler",
    "realistik-dildolar-sabitlenebilir-modeller": "Realistik Dildolar & Sabitlenebilir Modeller",
    "erkeklere-ozel-masturbatorler": "Erkeklere Özel Mastürbatörler",
    "realistik-deneyim-urunleri": "Realistik Deneyim Ürünleri",
    "gercekci-mankenler-ozel-seri": "Gerçekçi Mankenler (Özel Seri)",
    "fantezi-ve-rol-oyunlari": "Fantezi & Rol Oyunları",
    "performans-destek-urunleri": "Performans Destek Ürünleri"
  };

  const PLACEHOLDER = "./assets/placeholder.jpg";

  function pickImages(p) {
    if (Array.isArray(p.images) && p.images.length) {
      return p.images.filter(x => typeof x === "string" && x.trim());
    }
    if (typeof p.image === "string" && p.image) {
      return [p.image];
    }
    return [PLACEHOLDER];
  }

  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");

  const products = await window.GK.loadProducts();
  let p = null;

  if (id) {
    p = products.find(x => x.id === id);
  } else if (slug) {
    p = products.find(x => x.slug === slug);
  }

  const wrap = qs("#productWrap");
  if (!p) {
    wrap.innerHTML = `<div class="notice">Ürün bulunamadı. <a href="./products.html">Ürünlere dön</a></div>`;
    return;
  }

  qs("#pTitle").textContent = p.title;
  qs("#pCat").textContent = CATEGORY_LABELS[p.category] || p.category;
  qs("#pPrice").textContent = money(p.price);
  qs("#pDesc").textContent = p.description || "";

  // 1) SEO: Inject JSON-LD
  const availability = "https://schema.org/InStock"; // Varsayılan stokta
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.title,
    "image": pickImages(p),
    "description": p.description || p.title,
    "sku": p.id,
    "brand": {
      "@type": "Brand",
      "name": "Gizli Kutu"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "TRY",
      "price": p.price,
      "availability": availability,
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);

  /* ==========================
     IMAGE GALLERY
  ========================== */

  const imgEl = qs("#pImg");
  const thumbsBox = qs("#thumbs"); // product.html içine ekledik

  const images = pickImages(p);

  // İlk görsel
  imgEl.src = images[0];
  imgEl.alt = p.title || "Ürün";
  imgEl.loading = "lazy";

  imgEl.onerror = function () {
    this.onerror = null;
    this.src = PLACEHOLDER;
  };

  // Thumbnail temizle
  if (thumbsBox) {
    thumbsBox.innerHTML = "";

    images.forEach((src, i) => {
      const t = document.createElement("img");
      t.src = src;
      if (i === 0) t.classList.add("active");

      t.onerror = function () {
        this.onerror = null;
        this.src = PLACEHOLDER;
      };

      t.onclick = () => {
        imgEl.src = src;
        thumbsBox.querySelectorAll("img").forEach(x => x.classList.remove("active"));
        t.classList.add("active");
      };

      thumbsBox.appendChild(t);
    });
  }

  /* ==========================
     CART
  ========================== */

  const qty = qs("#qty");
  qs("#addToCart").addEventListener("click", () => {
    const q = Math.max(1, Number(qty.value || 1));
    window.GKStorage.addToCart(p, q);
    setCartBadge();
    toast("Sepete eklendi ✅");
  });

  /* ==========================
     IMAGE LIGHTBOX + ZOOM (MADDE 5,6)
  ========================== */

  // Platform detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;

  // Create lightbox
  function createLightbox() {
    const lightbox = document.createElement("div");
    lightbox.className = "product-lightbox";
    lightbox.innerHTML = `
      <button class="lightbox-close">✕</button>
      <div class="lightbox-image-wrap">
        <img src="" alt="Ürün görseli" />
      </div>
      <div class="lightbox-thumbs"></div>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  }

  const lightbox = createLightbox();
  const lbClose = lightbox.querySelector(".lightbox-close");
  const lbImageWrap = lightbox.querySelector(".lightbox-image-wrap");
  const lbImage = lbImageWrap.querySelector("img");
  const lbThumbs = lightbox.querySelector(".lightbox-thumbs");

  let currentImageIndex = 0;
  let isZoomed = false;
  let zoomLevel = 1;

  // Populate lightbox thumbnails
  images.forEach((src, i) => {
    const thumb = document.createElement("img");
    thumb.src = src;
    if (i === 0) thumb.classList.add("active");
    thumb.onclick = () => {
      currentImageIndex = i;
      showLightboxImage(i);
    };
    lbThumbs.appendChild(thumb);
  });

  function showLightboxImage(index) {
    lbImage.src = images[index];
    lbThumbs.querySelectorAll("img").forEach((t, i) => {
      t.classList.toggle("active", i === index);
    });
    // Reset zoom when changing image
    resetZoom();
  }

  function resetZoom() {
    isZoomed = false;
    zoomLevel = 1;
    lbImage.style.transform = "scale(1)";
    lbImageWrap.classList.remove("zoomed");
    lbImageWrap.scrollTop = 0;
    lbImageWrap.scrollLeft = 0;
  }

  function openLightbox(startIndex = 0) {
    currentImageIndex = startIndex;
    showLightboxImage(startIndex);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    resetZoom();
  }

  // Main image click to open lightbox
  imgEl.style.cursor = "pointer";
  imgEl.onclick = () => {
    const activeIndex = images.indexOf(imgEl.src) !== -1 ? images.indexOf(imgEl.src) : 0;
    openLightbox(activeIndex);
  };

  // Thumbnail clicks in page also open lightbox
  if (thumbsBox) {
    thumbsBox.querySelectorAll("img").forEach((thumb, i) => {
      const originalClick = thumb.onclick;
      thumb.onclick = (e) => {
        if (originalClick) originalClick.call(thumb, e);
        // Don't open lightbox on thumbnail click, just change main image
      };
    });
  }

  // Close button
  lbClose.onclick = closeLightbox;

  // Click outside to close
  lightbox.onclick = (e) => {
    if (e.target === lightbox) closeLightbox();
  };

  // Escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });

  /* PC ZOOM - Mouse based */
  if (!isMobile) {
    lbImageWrap.onclick = () => {
      if (!isZoomed) {
        // Zoom in
        isZoomed = true;
        zoomLevel = 2;
        lbImage.style.transform = `scale(${zoomLevel})`;
        lbImageWrap.classList.add("zoomed");
      } else {
        // Zoom out
        resetZoom();
      }
    };

    // Mouse move to pan when zoomed
    lbImageWrap.onmousemove = (e) => {
      if (!isZoomed) return;
      const rect = lbImageWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const scrollX = (lbImageWrap.scrollWidth - rect.width) * x;
      const scrollY = (lbImageWrap.scrollHeight - rect.height) * y;

      lbImageWrap.scrollLeft = scrollX;
      lbImageWrap.scrollTop = scrollY;
    };
  }

  /* MOBILE ZOOM - Pinch to zoom */
  if (isMobile) {
    let initialDistance = 0;
    let currentScale = 1;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    lbImageWrap.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
      } else if (e.touches.length === 1 && currentScale > 1) {
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      }
    }, { passive: true });

    lbImageWrap.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        const distance = getDistance(e.touches[0], e.touches[1]);
        const scale = Math.max(1, Math.min(4, currentScale * (distance / initialDistance)));
        lbImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        zoomLevel = scale;
        if (scale > 1) {
          lbImageWrap.classList.add("zoomed");
          isZoomed = true;
        }
      } else if (e.touches.length === 1 && currentScale > 1) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        lbImage.style.transform = `scale(${currentScale}) translate(${translateX / currentScale}px, ${translateY / currentScale}px)`;
      }
    }, { passive: true });

    lbImageWrap.addEventListener("touchend", (e) => {
      if (e.touches.length < 2) {
        currentScale = zoomLevel;
        if (currentScale <= 1) {
          resetZoom();
          currentScale = 1;
          translateX = 0;
          translateY = 0;
        }
      }
    }, { passive: true });

    // Double tap to zoom
    let lastTap = 0;
    lbImageWrap.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 300 && e.touches.length === 0) {
        if (isZoomed) {
          resetZoom();
          currentScale = 1;
          translateX = 0;
          translateY = 0;
        } else {
          currentScale = 2;
          zoomLevel = 2;
          lbImage.style.transform = "scale(2)";
          lbImageWrap.classList.add("zoomed");
          isZoomed = true;
        }
      }
      lastTap = now;
    }, { passive: true });

    function getDistance(t1, t2) {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }
})();

