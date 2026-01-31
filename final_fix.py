import os

# Genel düzeltmeler
replacements = {
    '81 ile Kargo Gönderim': '81 İle Kargo Gönderimi',
    '81 ile': '81 İle',
    'kapıda ödeme': 'Kapıda Ödeme',
    'Kapıda ödeme': 'Kapıda Ödeme',
    'Güvenli ödeme': 'Güvenli Ödeme',
    'HEadeR': 'Header',
    'S.S.S': 'SSS',
    'ONLİNE': 'ONLINE'
}

# fiyat-listesi.html özel düzeltmeler (Karakter bozulmaları)
fiyat_listesi_fixes = {
    'Ya Dorulama': 'Yaş Doğrulama',
    'yetikinlere ynelik': 'yetişkinlere yönelik',
    'iermektedir': 'içermektedir',
    'yandan byk': 'yaşından büyük',
    'Siteye giri iin': 'Siteye giriş için',
    'olmalsnz': 'olmalısınız',
    'Dorulama': 'Doğrulama',
    'Bym': 'Büyüğüm',
    'Km': 'Küçüğüm',
    'Yaşından Büyüğüm': 'Yaşından Büyüğüm', # Zaten düzelmiş olabilir
    'Yaşından Küçüğüm': 'Yaşından Küçüğüm'
}

public_dir = 'public'
if os.path.exists(public_dir):
    for filename in os.listdir(public_dir):
        if filename.endswith('.html'):
            path = os.path.join(public_dir, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                changed = False
                # Genel
                for old, new in replacements.items():
                    if old in content:
                        content = content.replace(old, new)
                        changed = True
                
                # Fiyat listesi özel
                if filename == 'fiyat-listesi.html':
                    for old, new in fiyat_listesi_fixes.items():
                        if old in content:
                            content = content.replace(old, new)
                            changed = True
                
                if changed:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Final Fix Applied: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
else:
    print("Public directory not found.")
