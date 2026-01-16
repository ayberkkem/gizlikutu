const fs = require('fs');
const path = require('path');

const cities = [
    { "name": "Adana", "districts": ["Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"] },
    { "name": "Adıyaman", "districts": ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"] },
    { "name": "Afyonkarahisar", "districts": ["Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Merkez", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"] },
    { "name": "Ağrı", "districts": ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"] },
    { "name": "Amasya", "districts": ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"] },
    { "name": "Ankara", "districts": ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"] },
    { "name": "Antalya", "districts": ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"] },
    { "name": "Artvin", "districts": ["Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Merkez", "Murgul", "Şavşat", "Yusufeli"] },
    { "name": "Aydın", "districts": ["Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"] },
    { "name": "Balıkesir", "districts": ["Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"] },
    { "name": "Bilecik", "districts": ["Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"] },
    { "name": "Bingöl", "districts": ["Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"] },
    { "name": "Bitlis", "districts": ["Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"] },
    { "name": "Bolu", "districts": ["Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", "Seben", "Yeniçağa"] },
    { "name": "Burdur", "districts": ["Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Merkez", "Tefenni", "Yeşilova"] },
    { "name": "Bursa", "districts": ["Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"] },
    { "name": "Çanakkale", "districts": ["Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Merkez", "Yenice"] },
    { "name": "Çankırı", "districts": ["Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Merkez", "Orta", "Şabanözü", "Yapraklı"] },
    { "name": "Çorum", "districts": ["Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Merkez", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"] },
    { "name": "Denizli", "districts": ["Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"] },
    { "name": "Diyarbakır", "districts": ["Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani", "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"] },
    { "name": "Edirne", "districts": ["Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"] },
    { "name": "Elazığ", "districts": ["Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Merkez", "Palu", "Sivrice"] },
    { "name": "Erzincan", "districts": ["Çayırlı", "İliç", "Kemah", "Kemaliye", "Merkez", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"] },
    { "name": "Erzurum", "districts": ["Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"] },
    { "name": "Eskişehir", "districts": ["Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"] },
    { "name": "Gaziantep", "districts": ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"] },
    { "name": "Giresun", "districts": ["Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Merkez", "Piraziz", "Şebinkarahisar", "Tirebolu", "Yağlıdere"] },
    { "name": "Gümüşhane", "districts": ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"] },
    { "name": "Hakkari", "districts": ["Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"] },
    { "name": "Hatay", "districts": ["Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa", "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"] },
    { "name": "Isparta", "districts": ["Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Merkez", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"] },
    { "name": "Mersin", "districts": ["Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar", "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"] },
    { "name": "İstanbul", "districts": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"] },
    { "name": "İzmir", "districts": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"] },
    { "name": "Kars", "districts": ["Akyaka", "Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz"] },
    { "name": "Kastamonu", "districts": ["Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Merkez", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"] },
    { "name": "Kayseri", "districts": ["Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan", "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza", "Yahyalı", "Yeşilhisar"] },
    { "name": "Kırklareli", "districts": ["Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"] },
    { "name": "Kırşehir", "districts": ["Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"] },
    { "name": "Kocaeli", "districts": ["Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"] },
    { "name": "Konya", "districts": ["Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli", "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar", "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent", "Tuzlukçu", "Yalıhüyük", "Yunak"] },
    { "name": "Kütahya", "districts": ["Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Merkez", "Pazarlar", "Simav", "Şaphane", "Tavşanlı"] },
    { "name": "Malatya", "districts": ["Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"] },
    { "name": "Manisa", "districts": ["Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç", "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Turgutlu", "Yunusemre"] },
    { "name": "Kahramanmaraş", "districts": ["Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"] },
    { "name": "Mardin", "districts": ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"] },
    { "name": "Muğla", "districts": ["Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"] },
    { "name": "Muş", "districts": ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"] },
    { "name": "Nevşehir", "districts": ["Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"] },
    { "name": "Niğde", "districts": ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"] },
    { "name": "Ordu", "districts": ["Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"] },
    { "name": "Rize", "districts": ["Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Merkez", "Pazar"] },
    { "name": "Sakarya", "districts": ["Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Söğütlü", "Taraklı"] },
    { "name": "Samsun", "districts": ["19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"] },
    { "name": "Siirt", "districts": ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"] },
    { "name": "Sinop", "districts": ["Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"] },
    { "name": "Sivas", "districts": ["Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Merkez", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"] },
    { "name": "Tekirdağ", "districts": ["Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"] },
    { "name": "Tokat", "districts": ["Almus", "Artova", "Başçiftlik", "Erbaa", "Merkez", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"] },
    { "name": "Trabzon", "districts": ["Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", "Ortahisar", "Sürmene", "Şalpazarı", "Tonya", "Vakfıkebir", "Yomra"] },
    { "name": "Tunceli", "districts": ["Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"] },
    { "name": "Şanlıurfa", "districts": ["Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"] },
    { "name": "Uşak", "districts": ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"] },
    { "name": "Van", "districts": ["Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"] },
    { "name": "Yozgat", "districts": ["Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Merkez", "Saraykent", "Sarıkaya", "Sorgun", "Şefaatli", "Yenifakılı", "Yerköy"] },
    { "name": "Zonguldak", "districts": ["Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu", "Merkez"] },
    { "name": "Aksaray", "districts": ["Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi", "Sultanhanı"] },
    { "name": "Bayburt", "districts": ["Aydıntepe", "Demirözü", "Merkez"] },
    { "name": "Karaman", "districts": ["Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"] },
    { "name": "Kırıkkale", "districts": ["Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"] },
    { "name": "Batman", "districts": ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"] },
    { "name": "Şırnak", "districts": ["Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"] },
    { "name": "Bartın", "districts": ["Amasra", "Kurucaşile", "Merkez", "Ulus"] },
    { "name": "Ardahan", "districts": ["Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"] },
    { "name": "Iğdır", "districts": ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"] },
    { "name": "Yalova", "districts": ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"] },
    { "name": "Karabük", "districts": ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"] },
    { "name": "Kilis", "districts": ["Elbeyli", "Merkez", "Musabeyli", "Polateli"] },
    { "name": "Osmaniye", "districts": ["Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"] },
    { "name": "Düzce", "districts": ["Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"] }
];

const templatePath = path.join(__dirname, 'public/akhisar-sex-shop.html');
const outputDir = path.join(__dirname, 'public');

if (!fs.existsSync(templatePath)) {
    console.error("Template file not found at " + templatePath);
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/i̇/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function processTemplate(cityName, isProvince = true, provinceName = "") {
    let content = template;
    const citySlug = slugify(cityName);
    const simpleName = cityName;

    // 1. Replacements
    content = content.replace(/Akhisar Sex Shop/g, `${simpleName} Sex Shop`);
    content = content.replace(/Seks Shop Akhisar/g, `Seks Shop ${simpleName}`);
    content = content.replace(/Akhisar sex shop/g, `${simpleName.toLowerCase()} sex shop`);
    content = content.replace(/seks shop Akhisar/g, `seks shop ${simpleName.toLowerCase()}`);
    content = content.replace(/akhisar sex shop/g, `${simpleName.toLowerCase()} sex shop`);
    content = content.replace(/manisa sex shop/g, `${(provinceName || simpleName).toLowerCase()} sex shop`);

    content = content.replace(/"addressLocality":"Akhisar"/g, `"addressLocality":"${simpleName}"`);
    content = content.replace(/"addressRegion":"Manisa"/g, `"addressRegion":"${provinceName || simpleName}"`);

    content = content.replace(/"hero-brand-title">AKHİSAR<\/div>/g, `"hero-brand-title">${simpleName.toUpperCase()}<\/div>`);
    content = content.replace(/Akhisar\'ın/g, `${simpleName}'nın`);
    content = content.replace(/Akhisar\'da/g, `${simpleName}'da`);
    content = content.replace(/Akhisar/g, simpleName);
    content = content.replace(/AKHİSAR/g, simpleName.toUpperCase());

    // 2. Delivery Logic for Non-Akhisar
    if (citySlug !== 'akhisar') {
        const deliverySectionRegex = /<section class="delivery-zone">[\s\S]*?<\/section>/;
        const newDeliverySection = `
        <section class="delivery-zone">
            <h2>${simpleName.toUpperCase()} HIZLI TESLİMAT</h2>
            <p>Siparişiniz <strong>${simpleName}</strong> ve tüm ilçelerine <strong>aynı gün kargo</strong> ile gizli paket olarak gönderilir.</p>
            <div class="delivery-features">
                <div>🚚 Aynı Gün Kargo</div>
                <div>🕵️ %100 Gizli Paketleme</div>
                <div>💳 Güvenli Ödeme</div>
            </div>
            <div class="neighborhoods">
                <strong>Teslimat:</strong> ${simpleName} genelindeki tüm adreslere, PTT Kargo veya Aras Kargo güvencesiyle teslimat yapılmaktadır.<br>
                <strong>Şube Teslim:</strong> Dilerseniz kargonuzu en yakın kargo şubesinden kimliğinizle teslim alabilirsiniz.<br>
                <strong>Ortalama Süre:</strong> 1-3 İş Günü
            </div>
        </section>`;
        content = content.replace(deliverySectionRegex, newDeliverySection);

        content = content.replace(/Akhisar İçi 1 Saat Teslimat/g, "Hızlı ve Gizli Kargo");
        content = content.replace(/1 Saat Teslimat/g, "Hızlı Kargo");
        content = content.replace(/SADECE 1 SAAT/g, "EN KISA SÜREDE");
        content = content.replace(/MOTORLU KURYE/g, "ÖZEL PAKETLEME");
        content = content.replace(/1 Saatte Teslim/g, "Aynı Gün Kargo");
        content = content.replace(/<span>🚚 .*?<\/span>/, "<span>🚚 Aynı Gün Gizli Kargo ✅</span>");
        content = content.replace(/Akhisar içi motor kurye ile 1 saat./g, "Siparişleriniz aynı gün kargoya verilir.");
        content = content.replace(/Akhisar içi KARGO YOK!/g, "Anlaşmalı kargo ile gönderim.");
    }

    content = content.replace(/akhisar-sex-shop\.html/g, `${citySlug}-sex-shop.html`);

    return { filename: `${citySlug}-sex-shop.html`, content: content };
}

// Generate
const generatedFiles = [];
cities.forEach(city => {
    // Province
    const provinceData = processTemplate(city.name, true, city.name);
    fs.writeFileSync(path.join(outputDir, provinceData.filename), provinceData.content);
    generatedFiles.push(provinceData.filename);

    // Districts
    if (city.districts && city.districts.length > 0) {
        city.districts.forEach(dist => {
            if (dist === "Merkez") return;
            const distData = processTemplate(dist, false, city.name);
            fs.writeFileSync(path.join(outputDir, distData.filename), distData.content);
            generatedFiles.push(distData.filename);
        });
    }
});

console.log(`Total ${generatedFiles.length} files generated.`);

// Sitemap
const sitemapPath = path.join(outputDir, 'sitemap.xml');
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const sitemapInsertionPoint = '</urlset>';
let newSitemapLinks = "";

generatedFiles.forEach(fname => {
    const url = `https://gizlikutu.online/${fname}`;
    if (!sitemapContent.includes(url)) {
        newSitemapLinks += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
});

if (newSitemapLinks) {
    const newSitemapContent = sitemapContent.replace(sitemapInsertionPoint, newSitemapLinks + sitemapInsertionPoint);
    fs.writeFileSync(sitemapPath, newSitemapContent);
    console.log("Sitemap updated.");
} else {
    console.log("Sitemap already up to date.");
}
