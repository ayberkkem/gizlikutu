document.addEventListener("DOMContentLoaded", function () {
    // Wheel loading disabled - was causing page freeze
    // if (!document.getElementById('gk-wheel-css')) { ... }
    // if (!document.getElementById('gk-wheel-js')) { ... }

    if (document.getElementById('cargo-timer-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cargo-timer-banner';

    const header = document.getElementById('mainHeader') || document.querySelector('header');
    if (header && header.parentNode) {
        header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
        document.body.prepend(banner);
    }

    // Styles for the banner - Mobile-first responsive design
    if (!document.getElementById('gk-banner-pulse-css')) {
        const style = document.createElement('style');
        style.id = 'gk-banner-pulse-css';
        style.textContent = `
            #cargo-timer-banner {
                background-image: url('./assets/backgrounds/premium-bg.webp');
                background-size: cover;
                background-position: center;
                padding: 12px 10px;
                display: none;
                flex-direction: column;
                gap: 10px;
                border-bottom: 2px solid rgba(229, 231, 235, 0.6);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                position: relative;
                z-index: 1000;
                width: 100%;
                box-sizing: border-box;
            }
            
            /* Mobil için 2x2 grid layout */
            .promo-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                width: 100%;
            }
            
            .promo-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 10px 12px;
                border-radius: 10px;
                font-weight: 700;
                font-size: 12px;
                text-decoration: none;
                text-align: center;
                white-space: nowrap;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .promo-btn:hover {
                transform: scale(1.02);
            }
            
            .promo-btn-kapida {
                background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
                color: #fff !important;
                box-shadow: 0 3px 8px rgba(225,29,72,0.3);
            }
            
            .promo-btn-whatsapp {
                background: #25D366;
                color: #fff !important;
                box-shadow: 0 3px 8px rgba(37,211,102,0.3);
            }
            
            .promo-btn-urunler {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: #fff !important;
                box-shadow: 0 3px 8px rgba(139,92,246,0.3);
            }
            
            .promo-btn-telegram {
                background: linear-gradient(135deg, #0088cc 0%, #229ED9 100%);
                color: #fff !important;
                box-shadow: 0 3px 8px rgba(0,136,204,0.3);
            }
            
            /* Desktop için tek satır */
            @media (min-width: 768px) {
                #cargo-timer-banner {
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    padding: 10px 20px;
                }
                
                .promo-grid {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 12px;
                    width: auto;
                }
                
                .promo-btn {
                    font-size: 14px;
                    padding: 10px 18px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function updateBanner() {
        banner.innerHTML = `
            <div class="promo-grid">
                <div class="promo-btn promo-btn-kapida">
                    🏠 Kapıda Ödeme
                </div>
                <a href="https://wa.me/905400443445" target="_blank" class="promo-btn promo-btn-whatsapp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                    WhatsApp
                </a>
                <a href="/products" class="promo-btn promo-btn-urunler">
                    🛍️ Ürünleri İncele
                </a>
                <a href="https://t.me/+905400443445" target="_blank" class="promo-btn promo-btn-telegram">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                        <path d="M20.665 3.717c.19-.098.402-.132.607-.096.205.035.395.138.544.295.149.157.25.36.29.582.04.223.017.454-.066.664L19.062 19.563c-.044.22-.15.423-.306.583-.156.16-.354.269-.569.315-.214.045-.435.024-.635-.06-.2-.084-.37-.228-.487-.413l-3.867-5.867-2.562 2.442c-.117.112-.265.185-.425.21-.16.025-.323 0-.47-.07-.147-.07-.27-.184-.353-.326-.083-.142-.123-.305-.114-.469l.417-5.167 8.75-4.541c.12-.064.225-.154.306-.263.081-.109.136-.233.16-.362.025-.13.018-.26-.02-.381-.037-.121-.104-.228-.195-.313-.09-.085-.202-.144-.326-.174-.124-.03-.256-.03-.385.002-.129.031-.251.092-.356.177-.106.086-.191.194-.249.315l-9.988 8.717-3.754-2.679c-.223-.155-.384-.373-.459-.622-.075-.25-.06-.517.042-.766l2.583-6.291c.084-.207.232-.383.425-.505.193-.122.421-.183.655-.176l13.785.839z"/>
                    </svg>
                    Telegram
                </a>
            </div>
        `;
        banner.style.display = 'flex';
    }

    updateBanner();
});
