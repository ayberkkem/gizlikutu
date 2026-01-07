(function(){
  function safeFbq(eventName, params){
    try { if (typeof window.fbq === "function") window.fbq("track", eventName, params || {}); } catch(e){}
  }
  function safeGtag(eventName, params){
    try { if (typeof window.gtag === "function") window.gtag("event", eventName, params || {}); } catch(e){}
  }

  function findWhatsAppLinks(){
    const links = Array.from(document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]'));
    return links;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const links = findWhatsAppLinks();
    if (!links.length) return;

    links.forEach(a => {
      a.addEventListener("click", () => {
        // ✅ Pixel (Lead daha mantıklı — Purchase sadece ödeme sonrası success’te)
        safeFbq("Lead", { content_name: "WhatsApp Support" });

        // ✅ GA4
        safeGtag("whatsapp_click", {
          method: "whatsapp",
          link_url: a.href
        });
      });
    });
  });
})();
