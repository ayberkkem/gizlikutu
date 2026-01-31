import os

replacements = {
    '18 Yandan': '18 Yaşından',
    'Men"': 'Menü"', # aria-label="Men" -> "Menü"
    'İİade & Deiim': 'İade & Değişim',
    'Gizlilik Politikas': 'Gizlilik Politikası',
    'Kullanm Koullar': 'Kullanım Koşulları',
    'Mesafeli Sat': 'Mesafeli Satış',
    'Sk Sorulan Sorular': 'Sık Sorulan Sorular',
    'var m?': 'var mı?',
    'tm sipariler': 'tüm siparişler',
    'gnderilir': 'gönderilir',
    'Teslimat sresi?': 'Teslimat süresi?',
    'Akhisar ii': 'Akhisar içi',
    'Trkiye geneli': 'Türkiye geneli',
    'i gn': 'iş günü',
    'Kapıda Ödeme var m?': 'Kapıda Ödeme var mı?',
    'kredi kart ile': 'kredi kartı ile',
    'kapda ödeme': 'kapıda ödeme',
    'iletiime geebilirsiniz': 'iletişime geçebilirsiniz',
    'E-Posta': 'E-Posta',
    'Vibratrler': 'Vibratörler',
    'Mastrbatrler': 'Mastürbatörler',
    'Kayganlatrc': 'Kayganlaştırıcı',
    'Popler': 'Popüler',
    'Vibratr': 'Vibratör',
    'Mastrbatr': 'Mastürbatör',
    'Keşfetmeye Başla ': 'Keşfetmeye Başla',
    'Akhisar\'da sex shop var m?': 'Akhisar\'da sex shop var mı?',
    'mteri': 'müşteri',
    'gizliliine': 'gizliliğine',
    'verdiimiz': 'verdiğimiz',
    'nem': 'önem',
    'dardan ierii': 'dışarıdan içeriği',
    'ekilde': 'şekilde',
    'zenle': 'özenle',
    'grevlisi': 'görevlisi',
    'hi kimse': 'hiç kimse',
    'olduunu': 'olduğunu',
    'gvencesiyle': 'güvencesiyle',
    'alverilerinizi': 'alışverişlerinizi',
    'gvenle': 'güvenle',
    'Akhisar i ': 'Akhisar içi ',
    'verdiiniz': 'verdiğiniz',
    'siparilerde': 'siparişlerde',
    'Akhisar ii KARGO YOK!': 'Akhisar İçi KARGO YOK!',
    'MOTORLU KURYE': 'MOTORLU KURYE',
    'SadeCE': 'SADECE',
    'kapnza': 'kapınıza',
    'setiiniz': 'seçtiğiniz',
    'zel': 'özel',
    'Belediye n': 'Belediye Önü',
    'AVM n': 'AVM Önü',
    'salanr': 'sağlanır',
    'deitirmek': 'değiştirmek',
    'sipariinizin': 'siparişinizin',
    'ulamas': 'ulaşması',
    'sipari notu': 'sipariş notu',
    'zerinden': 'üzerinden',
    'ulaabilirsiniz': 'ulaşabilirsiniz',
    'Nasl Yaplyor?': 'Nasıl Yapılıyor?',
    'effaf': 'şeffaf',
    'ieriine': 'içeriğine',
    'hibir': 'hiçbir',
    'ödeme Seenekleri': 'Ödeme Seçenekleri',
    'Kategori ykleme hatas': 'Kategori yükleme hatası',
    'Kiisel veriler': 'Kişisel veriler',
    'erezler & gvenlik': 'Çerezler & güvenlik',
    'Sat artlar': 'Satış şartları',
    ' Ürünleri': ' Ürünleri', # Correcting potential encoding glitch if present
    'GZL KUTU': 'GİZLİ KUTU',
    'Kendin in Alveri': 'Kendin İçin Alışveriş',
    'yetikin': 'yetişkin',
    'Ürünleri': 'Ürünleri',
    'iermektedir': 'içermektedir',
    'olmalsnz': 'olmalısınız',
    'Dorulama': 'Doğrulama',
    'yandan byk': 'yaşından büyük',
    'Men"': 'Menü"',
    'giri iin': 'giriş için',
    'vibratr': 'vibratör',
    'kadn': 'kadın',
    'Hzl': 'Hızlı',
    'Blgemiz': 'Bölgemiz',
    'salanan': 'sağlanan',
    'blgeler': 'bölgeler',
    'iin': 'için',
    'grnz': 'görüşünüz',
    'aadaki': 'aşağıdaki',
    'güvenli Alveriin': 'Güvenli Alışverişin',
    'lkesi': 'ilkesi',
    'salk': 'sağlık',
    'Geni': 'Geniş',
    'sektrde': 'sektörde',
    'yaratyoruz': 'yaratıyoruz',
    'bakm': 'bakım',
    'aradnz': 'aradığınız',
    'ey': 'şey',
    'ierii': 'içeriği',
    'birok': 'birçok',
    'yalar': 'yağları',
    'korunmaktadr': 'korunmaktadır',
    'sertifikas': 'sertifikası',
    'Kapıda Ödeme var m?': 'Kapıda Ödeme var mı?',
    'Kapıda Ödeme var m': 'Kapıda Ödeme var mı',
    'Akhisar i': 'Akhisar İçi',
    'Alveri': 'Alışveriş',
    'Gizliliin': 'Gizliliğin',
    'Gnderim': 'Gönderim',
    'Ürünleri Gr': 'Ürünleri Gör',
    'gnderimlerinde': 'gönderimlerinde',
    'İİade': 'İade'
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
            print(f"Fixed encoding issues in: {path}")
        else:
            print("No changes needed.")
    except Exception as e:
        print(f"Error processing {path}: {e}")
else:
    print(f"File not found: {path}")
