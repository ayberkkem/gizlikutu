import os

replacements = {
    'Sitşeye': 'Siteye',
    'öözel': 'özel',
    'İçiçi': 'İçi',
    'var mıı?': 'var mı?',
    'vşeya': 'veya',
    'kşeyframes': 'keyframes',
    'Gven': 'Güven',
    'Keşfetmşeye': 'Keşfetmeye',
    'Alışverişçin': 'Alışverişin',
    'sprşeylere': 'spreylere',
    'Gizliliçin': 'Gizliliğin',
    'eklşeyebilir': 'ekleyebilirsiniz',
    '??': '🔞', # Icon guess
    'şş': 'ş', # Double char fix attempt
    'İçii': 'İçi',
    'mıı': 'mı'
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
        
        # Lowercase Ürünler check (simple heuristic)
        # We don't want to lowercase 'Ürünler' at Start of sentence.
        # But 'yönelik Ürünler' should be 'yönelik ürünler'.
        if 'yönelik Ürünler' in content:
            content = content.replace('yönelik Ürünler', 'yönelik ürünler')
            changed = True
        if 'Geniş Ürün' in content:
            content = content.replace('Geniş Ürün', 'Geniş ürün')
            changed = True
        if 'bakım Ürünlerine' in content:
            content = content.replace('bakım Ürünlerine', 'bakım ürünlerine')
            changed = True
        
        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleanup applied to: {path}")
        else:
            print("No changes needed in cleanup.")
    except Exception as e:
        print(f"Error processing {path}: {e}")
else:
    print(f"File not found: {path}")
