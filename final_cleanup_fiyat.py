import os

replacements = {
    'Mteri': 'Müşteri',
    'Seenekleri': 'Seçenekleri',
    'seeneklerini': 'seçeneklerini',
    'hzl': 'hızlı',
    'Tm siparileriniz': 'Tüm siparişleriniz',
    'kapal': 'kapalı',
    'zerinde': 'üzerinde',
    'Kredi kart ': 'Kredi kartı ',
    'seeneklerimiz': 'seçeneklerimiz',
    'i giyim': 'iç giyim',
    'kayganlatrclar': 'kayganlaştırıcılar',
    'bulunmaktadr': 'bulunmaktadır',
    'trlu': 'türlü',
    'Sipari': 'Sipariş',
    'blgeler': 'bölgeler',
    'Blgemiz': 'Bölgemiz', # Case sensitive
    'lkesi': 'ilkesi',
    'salk': 'sağlık',
    'sektrde': 'sektörde',
    'nem': 'önem',
    'ierii': 'içeriği',
    'yalar': 'yağları',
    'birok': 'birçok',
    'korunmaktadr': 'korunmaktadır',
    'sertifikas': 'sertifikası',
    'Geni': 'Geniş',
    'Geniş Ürün': 'Geniş ürün', # Already fixed but good to keep
    'yönelik Ürünler': 'yönelik ürünler',
    'bakım Ürünlerine': 'bakım ürünlerine'
}

path = 'public/fiyat-listesi.html'
if os.path.exists(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        changed = False
        for old, new in replacements.items():
            if old in content:
                content = content.replace(old, new)
                changed = True
        
        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Final cleanup applied to: {path}")
        else:
            print("No changes needed in final cleanup.")
    except Exception as e:
        print(f"Error processing {path}: {e}")
else:
    print(f"File not found: {path}")
