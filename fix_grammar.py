import os

city_fixes = {
    "Adıyaman'nın": "Adıyaman'ın",
    "Afyonkarahisar'nın": "Afyonkarahisar'ın",
    "Ağrı'nın": "Ağrı'nın", # Doğru
    "Aksaray'nın": "Aksaray'ın",
    "Amasya'nın": "Amasya'nın", # Doğru
    "Ankara'nın": "Ankara'nın", # Doğru
    "Antalya'nın": "Antalya'nın", # Doğru
    "Ardahan'nın": "Ardahan'ın",
    "Artvin'nın": "Artvin'in",
    "Aydın'nın": "Aydın'ın",
    "Balıkesir'nın": "Balıkesir'in",
    "Bartın'nın": "Bartın'ın",
    "Batman'nın": "Batman'ın",
    "Bayburt'nın": "Bayburt'un",
    "Bilecik'nın": "Bilecik'in",
    "Bingöl'nın": "Bingöl'ün",
    "Bitlis'nın": "Bitlis'in",
    "Bolu'nın": "Bolu'nun",
    "Burdur'nın": "Burdur'un",
    "Bursa'nın": "Bursa'nın", # Doğru
    "Çanakkale'nın": "Çanakkale'nin",
    "Çankırı'nın": "Çankırı'nın", # Doğru
    "Çorum'nın": "Çorum'un",
    "Denizli'nın": "Denizli'nin",
    "Diyarbakır'nın": "Diyarbakır'ın",
    "Düzce'nın": "Düzce'nin",
    "Edirne'nın": "Edirne'nin",
    "Elazığ'nın": "Elazığ'ın",
    "Erzincan'nın": "Erzincan'ın",
    "Erzurum'nın": "Erzurum'un",
    "Eskişehir'nın": "Eskişehir'in",
    "Gaziantep'nın": "Gaziantep'in",
    "Giresun'nın": "Giresun'un",
    "Gümüşhane'nın": "Gümüşhane'nin",
    "Hakkari'nın": "Hakkari'nin",
    "Hatay'nın": "Hatay'ın",
    "Iğdır'nın": "Iğdır'ın",
    "Isparta'nın": "Isparta'nın", # Doğru
    "İstanbul'nın": "İstanbul'un",
    "İzmir'nın": "İzmir'in",
    "Kahramanmaraş'nın": "Kahramanmaraş'ın",
    "Karabük'nın": "Karabük'ün",
    "Karaman'nın": "Karaman'ın",
    "Kars'nın": "Kars'ın",
    "Kastamonu'nın": "Kastamonu'nun",
    "Kayseri'nın": "Kayseri'nin",
    "Kırıkkale'nın": "Kırıkkale'nin",
    "Kırklareli'nın": "Kırklareli'nin",
    "Kırşehir'nın": "Kırşehir'in",
    "Kilis'nın": "Kilis'in",
    "Kocaeli'nın": "Kocaeli'nin",
    "Konya'nın": "Konya'nın", # Doğru
    "Kütahya'nın": "Kütahya'nın", # Doğru
    "Malatya'nın": "Malatya'nın", # Doğru
    "Manisa'nın": "Manisa'nın", # Doğru
    "Mardin'nın": "Mardin'in",
    "Mersin'nın": "Mersin'in",
    "Muğla'nın": "Muğla'nın", # Doğru
    "Muş'nın": "Muş'un",
    "Nevşehir'nın": "Nevşehir'in",
    "Niğde'nın": "Niğde'nin",
    "Ordu'nın": "Ordu'nun",
    "Osmaniye'nın": "Osmaniye'nin",
    "Rize'nın": "Rize'nin",
    "Sakarya'nın": "Sakarya'nın", # Doğru
    "Samsun'nın": "Samsun'un",
    "Siirt'nın": "Siirt'in",
    "Sinop'nın": "Sinop'un",
    "Sivas'nın": "Sivas'ın",
    "Şanlıurfa'nın": "Şanlıurfa'nın", # Doğru
    "Şırnak'nın": "Şırnak'ın",
    "Tekirdağ'nın": "Tekirdağ'ın",
    "Tokat'nın": "Tokat'ın",
    "Trabzon'nın": "Trabzon'un",
    "Tunceli'nın": "Tunceli'nin",
    "Uşak'nın": "Uşak'ın",
    "Van'nın": "Van'ın",
    "Yalova'nın": "Yalova'nın", # Doğru
    "Yozgat'nın": "Yozgat'ın",
    "Zonguldak'nın": "Zonguldak'ın"
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
                for old, new in city_fixes.items():
                    if old in content:
                        content = content.replace(old, new)
                        changed = True
                
                if changed:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed grammar in: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
else:
    print("Public directory not found.")
