import os

replacements = {
    '81 ile Kargo Gönderim': '81 İle Kargo Gönderimi',
    'kapıda ödeme': 'Kapıda Ödeme',
    'Kapıda ödeme': 'Kapıda Ödeme',
    'Güvenli ödeme': 'Güvenli Ödeme',
    'HEadeR': 'Header',
    'S.S.S': 'SSS',
    'ONLİNE': 'ONLINE'
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
                for old, new in replacements.items():
                    if old in content:
                        content = content.replace(old, new)
                        changed = True
                
                if changed:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
else:
    print("Public directory not found.")
