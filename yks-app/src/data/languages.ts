export type LanguageId =
  | "ja"
  | "zh"
  | "fr"
  | "ru"
  | "es"
  | "de"
  | "it"
  | "ko"
  | "ar"
  | "pt"
  | "el"
  | "pl"
  | "sv"
  | "hi";

export type Phrase = { item: string; reading?: string; translation: string };
export type Unit = { title: string; phrases: Phrase[] };
export type LanguageResource = { title: string; url: string; note?: string };

export type Language = {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  hello: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  basics: Phrase[];
  units?: Unit[]; // tematik kelime/ifade paketleri
  resources?: LanguageResource[]; // dile özel ücretsiz kaynaklar
  alphabetIntro: string;
  aiSystemHint: string;
  bcp47: string; // Web Speech API için
  wikiSlug?: string; // tr.wikipedia.org/wiki/{slug}_dili (varsayılan: name'den türetilir)
};

export const languages: Language[] = [
  {
    id: "ja",
    name: "Japonca",
    nativeName: "日本語",
    flag: "🇯🇵",
    hello: "こんにちは",
    description:
      "Hiragana, Katakana ve Kanji üç yazı sistemini birlikte kullanır. SOV cümle yapısı.",
    difficulty: 4,
    alphabetIntro:
      "Hiragana 46 temel karakter, Katakana yabancı kelimeler için, Kanji ise Çince kökenli ideogramlar (~2000+ günlük kullanım).",
    basics: [
      { item: "こんにちは", reading: "konnichiwa", translation: "Merhaba" },
      { item: "ありがとう", reading: "arigatou", translation: "Teşekkürler" },
      { item: "はい / いいえ", reading: "hai / iie", translation: "Evet / Hayır" },
      { item: "すみません", reading: "sumimasen", translation: "Affedersiniz / Pardon" },
      { item: "わたし", reading: "watashi", translation: "Ben" },
      { item: "なまえ", reading: "namae", translation: "İsim" },
      { item: "1, 2, 3", reading: "ichi, ni, san", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "一", reading: "ichi", translation: "1" },
          { item: "二", reading: "ni", translation: "2" },
          { item: "三", reading: "san", translation: "3" },
          { item: "四", reading: "yon / shi", translation: "4" },
          { item: "五", reading: "go", translation: "5" },
          { item: "六", reading: "roku", translation: "6" },
          { item: "七", reading: "nana / shichi", translation: "7" },
          { item: "八", reading: "hachi", translation: "8" },
          { item: "九", reading: "kyuu / ku", translation: "9" },
          { item: "十", reading: "juu", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "おはよう", reading: "ohayou", translation: "Günaydın" },
          { item: "こんばんは", reading: "konbanwa", translation: "İyi akşamlar" },
          { item: "おやすみ", reading: "oyasumi", translation: "İyi geceler" },
          { item: "さようなら", reading: "sayounara", translation: "Hoşça kal" },
          { item: "おねがいします", reading: "onegaishimasu", translation: "Lütfen" },
          { item: "わかりません", reading: "wakarimasen", translation: "Anlamıyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Japonca öğreten sabırlı bir öğretmensin. Her Japonca cümleyi mutlaka hem hiragana/katakana/kanji ile yaz, hem romaji okunuşunu ver, hem Türkçe çevirisini yaz. Öğrenciyi cesaretlendir.",
    bcp47: "ja-JP",
  },
  {
    id: "zh",
    name: "Çince",
    nativeName: "中文",
    flag: "🇨🇳",
    hello: "你好",
    description:
      "Mandarin Çincesi, dünyanın en çok konuşulan dili. Ton sistemi (4 ton) ve karakter bazlı yazım.",
    difficulty: 5,
    alphabetIntro:
      "Çincede alfabe yoktur — karakterleri (汉字) öğrenirsin. Telaffuz için pinyin (ä, ě, ó vb. tonlu) Latin alfabesinde yazılır. 4 ton + nötr ton var.",
    basics: [
      { item: "你好", reading: "nǐ hǎo", translation: "Merhaba" },
      { item: "谢谢", reading: "xièxie", translation: "Teşekkürler" },
      { item: "是 / 不是", reading: "shì / bú shì", translation: "Evet / Hayır" },
      { item: "对不起", reading: "duìbuqǐ", translation: "Affedersin" },
      { item: "我", reading: "wǒ", translation: "Ben" },
      { item: "名字", reading: "míngzi", translation: "İsim" },
      { item: "一, 二, 三", reading: "yī, èr, sān", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "一", reading: "yī", translation: "1" },
          { item: "二", reading: "èr", translation: "2" },
          { item: "三", reading: "sān", translation: "3" },
          { item: "四", reading: "sì", translation: "4" },
          { item: "五", reading: "wǔ", translation: "5" },
          { item: "六", reading: "liù", translation: "6" },
          { item: "七", reading: "qī", translation: "7" },
          { item: "八", reading: "bā", translation: "8" },
          { item: "九", reading: "jiǔ", translation: "9" },
          { item: "十", reading: "shí", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "早上好", reading: "zǎoshang hǎo", translation: "Günaydın" },
          { item: "晚上好", reading: "wǎnshang hǎo", translation: "İyi akşamlar" },
          { item: "晚安", reading: "wǎn'ān", translation: "İyi geceler" },
          { item: "再见", reading: "zàijiàn", translation: "Hoşça kal" },
          { item: "请", reading: "qǐng", translation: "Lütfen" },
          { item: "我不懂", reading: "wǒ bù dǒng", translation: "Anlamıyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Mandarin Çincesi öğreten sabırlı bir öğretmensin. Her Çince ifadeyi mutlaka hem karakterle (汉字), hem pinyinle (tonlu işaretlerle: ǎ ē ì ó ǔ), hem Türkçe çeviriyle yaz. Ton işaretlerini doğru kullan.",
    bcp47: "zh-CN",
  },
  {
    id: "fr",
    name: "Fransızca",
    nativeName: "Français",
    flag: "🇫🇷",
    hello: "Bonjour",
    description:
      "Romantik dil ailesinden. Cinsiyetli isimler (le/la), zengin fiil çekimleri.",
    difficulty: 3,
    alphabetIntro:
      "Latin alfabesini kullanır, é è ê à â ç ï î ô ù û özel harfler var. Yazıldığı gibi okunmaz; bazı sesler yazıdan farklı.",
    basics: [
      { item: "Bonjour", translation: "Merhaba (gün boyu)" },
      { item: "Bonsoir", translation: "İyi akşamlar" },
      { item: "Merci", translation: "Teşekkürler" },
      { item: "Oui / Non", translation: "Evet / Hayır" },
      { item: "Pardon / Excusez-moi", translation: "Affedersiniz" },
      { item: "Je m'appelle…", translation: "Adım…" },
      { item: "Un, deux, trois", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "un", translation: "1" },
          { item: "deux", translation: "2" },
          { item: "trois", translation: "3" },
          { item: "quatre", translation: "4" },
          { item: "cinq", translation: "5" },
          { item: "six", translation: "6" },
          { item: "sept", translation: "7" },
          { item: "huit", translation: "8" },
          { item: "neuf", translation: "9" },
          { item: "dix", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Comment ça va?", translation: "Nasılsın?" },
          { item: "Ça va bien", translation: "İyiyim" },
          { item: "S'il vous plaît", translation: "Lütfen (resmi)" },
          { item: "Je ne comprends pas", translation: "Anlamıyorum" },
          { item: "Au revoir", translation: "Hoşça kal" },
          { item: "À bientôt", translation: "Görüşürüz" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Fransızca öğreten sabırlı bir öğretmensin. Her Fransızca cümleyi yaz, parantez içinde fonetik okunuşu (IPA değil, basitleştirilmiş) ve Türkçe çevirisini ver. Cinsiyet (m/f) ekle.",
    bcp47: "fr-FR",
  },
  {
    id: "ru",
    name: "Rusça",
    nativeName: "Русский",
    flag: "🇷🇺",
    hello: "Привет",
    description:
      "Slav dil ailesi. Kiril alfabesi (33 harf), zengin durum sistemi (6 durum), cinsiyet ayrımı.",
    difficulty: 4,
    alphabetIntro:
      "Kiril alfabesi 33 harf. Bir kısmı Latin'e benzer ama farklı sesler verir (Р=R, В=V, Н=N, Н≠H). Vurgu yeri kelimenin anlamını değiştirebilir.",
    basics: [
      { item: "Привет", reading: "privet", translation: "Selam" },
      { item: "Здравствуйте", reading: "zdrastvuyte", translation: "Merhaba (resmi)" },
      { item: "Спасибо", reading: "spasiba", translation: "Teşekkürler" },
      { item: "Да / Нет", reading: "da / nyet", translation: "Evet / Hayır" },
      { item: "Извините", reading: "izvinite", translation: "Affedersiniz" },
      { item: "Меня зовут…", reading: "menya zovut…", translation: "Adım…" },
      { item: "Один, два, три", reading: "odin, dva, tri", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "один", reading: "odin", translation: "1" },
          { item: "два", reading: "dva", translation: "2" },
          { item: "три", reading: "tri", translation: "3" },
          { item: "четыре", reading: "chetyre", translation: "4" },
          { item: "пять", reading: "pyat", translation: "5" },
          { item: "шесть", reading: "shest", translation: "6" },
          { item: "семь", reading: "sem", translation: "7" },
          { item: "восемь", reading: "vosem", translation: "8" },
          { item: "девять", reading: "devyat", translation: "9" },
          { item: "десять", reading: "desyat", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Доброе утро", reading: "dobroye utro", translation: "Günaydın" },
          { item: "Добрый вечер", reading: "dobryy vecher", translation: "İyi akşamlar" },
          { item: "Спокойной ночи", reading: "spokoynoy nochi", translation: "İyi geceler" },
          { item: "До свидания", reading: "do svidaniya", translation: "Hoşça kal" },
          { item: "Пожалуйста", reading: "pozhaluysta", translation: "Lütfen / Rica ederim" },
          { item: "Я не понимаю", reading: "ya ne ponimayu", translation: "Anlamıyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Rusça öğreten sabırlı bir öğretmensin. Her Rusça cümleyi Kiril alfabesiyle yaz, parantez içinde Latin transkripsiyon ve Türkçe çevirisini ver. Vurgulu heceyi büyük harfle göster (ör. priVET).",
    bcp47: "ru-RU",
  },
  {
    id: "es",
    name: "İspanyolca",
    nativeName: "Español",
    flag: "🇪🇸",
    hello: "¡Hola!",
    description:
      "Dünyanın en çok konuşulan ikinci ana dili. Düzenli telaffuz (yazıldığı gibi okunur). Türkler için en hızlı öğrenilen Avrupa dillerinden.",
    difficulty: 2,
    alphabetIntro:
      "Latin alfabesi + ñ. Aksanlar (á é í ó ú) vurguyu işaretler. j sert h gibi, c+e/i 'th' ya da 's', ll genelde 'y', rr titrek.",
    basics: [
      { item: "Hola", translation: "Merhaba" },
      { item: "Gracias", translation: "Teşekkürler" },
      { item: "Sí / No", translation: "Evet / Hayır" },
      { item: "Perdón / Lo siento", translation: "Affedersiniz / Üzgünüm" },
      { item: "Yo", translation: "Ben" },
      { item: "Me llamo…", translation: "Adım…" },
      { item: "Uno, dos, tres", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "uno", translation: "1" },
          { item: "dos", translation: "2" },
          { item: "tres", translation: "3" },
          { item: "cuatro", translation: "4" },
          { item: "cinco", translation: "5" },
          { item: "seis", translation: "6" },
          { item: "siete", translation: "7" },
          { item: "ocho", translation: "8" },
          { item: "nueve", translation: "9" },
          { item: "diez", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Buenos días", translation: "Günaydın" },
          { item: "Buenas tardes", translation: "Tünaydın / İyi öğleden sonralar" },
          { item: "Buenas noches", translation: "İyi geceler" },
          { item: "Adiós", translation: "Hoşça kal" },
          { item: "Por favor", translation: "Lütfen" },
          { item: "No entiendo", translation: "Anlamıyorum" },
          { item: "¿Cómo estás?", translation: "Nasılsın?" },
        ],
      },
    ],
    aiSystemHint:
      "Sen İspanyolca öğreten sabırlı bir öğretmensin. Her İspanyolca cümleyi yaz, parantez içinde Türkçe çevirisini ver. İsimlerde cinsiyeti (m/f) ve fiil çekimini kısaca belirt. ñ ve aksan işaretlerini doğru kullan.",
    bcp47: "es-ES",
  },
  {
    id: "de",
    name: "Almanca",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    hello: "Hallo!",
    description:
      "Germen dil ailesi. Üç cinsiyet (der/die/das), dört durum, bileşik kelimeler. Disiplinli yaklaşırsan mantıksal yapısı seni sever.",
    difficulty: 3,
    alphabetIntro:
      "Latin alfabesi + ä ö ü ß (Eszett). İsimler büyük harfle başlar (Substantive: das Auto). Telaffuz yazıma yakın; ie='i:', ei='ay', sch='ş', z='ts'.",
    basics: [
      { item: "Hallo", translation: "Merhaba" },
      { item: "Danke", translation: "Teşekkürler" },
      { item: "Ja / Nein", translation: "Evet / Hayır" },
      { item: "Entschuldigung", translation: "Affedersiniz" },
      { item: "Ich", translation: "Ben" },
      { item: "Ich heiße…", translation: "Adım…" },
      { item: "Eins, zwei, drei", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "eins", translation: "1" },
          { item: "zwei", translation: "2" },
          { item: "drei", translation: "3" },
          { item: "vier", translation: "4" },
          { item: "fünf", translation: "5" },
          { item: "sechs", translation: "6" },
          { item: "sieben", translation: "7" },
          { item: "acht", translation: "8" },
          { item: "neun", translation: "9" },
          { item: "zehn", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Guten Morgen", translation: "Günaydın" },
          { item: "Guten Abend", translation: "İyi akşamlar" },
          { item: "Gute Nacht", translation: "İyi geceler" },
          { item: "Auf Wiedersehen", translation: "Hoşça kal (resmi)" },
          { item: "Tschüss", translation: "Görüşürüz (samimi)" },
          { item: "Bitte", translation: "Lütfen / Rica ederim" },
          { item: "Ich verstehe nicht", translation: "Anlamıyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Almanca öğreten sabırlı bir öğretmensin. Her Almanca cümleyi yaz, Türkçe çevirisini ver. İsimlerin yanına cinsiyet artikellerini (der/die/das) ekle. ä ö ü ß karakterlerini doğru kullan.",
    bcp47: "de-DE",
  },
  {
    id: "it",
    name: "İtalyanca",
    nativeName: "Italiano",
    flag: "🇮🇹",
    hello: "Ciao!",
    description:
      "Romantik dil; melodisi ve telaffuzu Türklere yakın. Latin alfabesinin küçük (21 harf) versiyonu.",
    difficulty: 2,
    alphabetIntro:
      "Latin alfabesi 21 harf (j k w x y yabancı kelimeler için). Vurgu çoğunlukla sondan bir önceki hecede. Yazıldığı gibi okunur. c+e/i='ç', ch='k', gli='lyi', gn='ny'.",
    basics: [
      { item: "Ciao", translation: "Selam / Hoşça kal" },
      { item: "Grazie", translation: "Teşekkürler" },
      { item: "Sì / No", translation: "Evet / Hayır" },
      { item: "Scusa / Mi scusi", translation: "Affedersin / Affedersiniz" },
      { item: "Io", translation: "Ben" },
      { item: "Mi chiamo…", translation: "Adım…" },
      { item: "Uno, due, tre", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "uno", translation: "1" },
          { item: "due", translation: "2" },
          { item: "tre", translation: "3" },
          { item: "quattro", translation: "4" },
          { item: "cinque", translation: "5" },
          { item: "sei", translation: "6" },
          { item: "sette", translation: "7" },
          { item: "otto", translation: "8" },
          { item: "nove", translation: "9" },
          { item: "dieci", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Buongiorno", translation: "Günaydın / İyi günler" },
          { item: "Buonasera", translation: "İyi akşamlar" },
          { item: "Buonanotte", translation: "İyi geceler" },
          { item: "Arrivederci", translation: "Hoşça kal" },
          { item: "Per favore", translation: "Lütfen" },
          { item: "Non capisco", translation: "Anlamıyorum" },
          { item: "Come stai?", translation: "Nasılsın?" },
        ],
      },
    ],
    aiSystemHint:
      "Sen İtalyanca öğreten sabırlı bir öğretmensin. Her İtalyanca cümleyi yaz, Türkçe çevirisini ver. İsimlerde cinsiyet (m/f), fiil çekiminde özneyi belirt. Vurgulu heceyi gerektiğinde işaretle.",
    bcp47: "it-IT",
  },
  {
    id: "ko",
    name: "Korece",
    nativeName: "한국어",
    flag: "🇰🇷",
    hello: "안녕하세요",
    description:
      "K-pop ve K-drama ile popülerleşti. Hangul alfabesi mantıksal ve birkaç günde okuma sökülür. SOV cümle yapısı.",
    difficulty: 4,
    alphabetIntro:
      "Hangul: 14 ünsüz + 10 ünlü; harfler hece bloklarına dizilir (ör. 한 = ㅎ+ㅏ+ㄴ). Karakter değil alfabe — bir günde okuma kazanılabilir. Kibar/samimi konuşma seviyeleri var.",
    basics: [
      { item: "안녕하세요", reading: "annyeong-haseyo", translation: "Merhaba (resmi)" },
      { item: "안녕", reading: "annyeong", translation: "Selam (samimi)" },
      { item: "감사합니다", reading: "gamsahamnida", translation: "Teşekkürler (resmi)" },
      { item: "네 / 아니요", reading: "ne / aniyo", translation: "Evet / Hayır" },
      { item: "죄송합니다", reading: "joesonghamnida", translation: "Özür dilerim" },
      { item: "저는…", reading: "jeoneun…", translation: "Ben…" },
      { item: "하나, 둘, 셋", reading: "hana, dul, set", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10 (saf Korece)",
        phrases: [
          { item: "하나", reading: "hana", translation: "1" },
          { item: "둘", reading: "dul", translation: "2" },
          { item: "셋", reading: "set", translation: "3" },
          { item: "넷", reading: "net", translation: "4" },
          { item: "다섯", reading: "daseot", translation: "5" },
          { item: "여섯", reading: "yeoseot", translation: "6" },
          { item: "일곱", reading: "ilgop", translation: "7" },
          { item: "여덟", reading: "yeodeol", translation: "8" },
          { item: "아홉", reading: "ahop", translation: "9" },
          { item: "열", reading: "yeol", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "좋은 아침이에요", reading: "joeun achimieyo", translation: "Günaydın" },
          { item: "잘 자요", reading: "jal jayo", translation: "İyi geceler" },
          { item: "안녕히 가세요", reading: "annyeonghi gaseyo", translation: "Güle güle (kalan söyler)" },
          { item: "이해 못해요", reading: "ihae motaeyo", translation: "Anlamıyorum" },
          { item: "괜찮아요", reading: "gwaenchanayo", translation: "İyiyim / Sorun yok" },
          { item: "사랑해요", reading: "saranghaeyo", translation: "Seni seviyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Korece öğreten sabırlı bir öğretmensin. Her Korece cümleyi Hangul ile yaz, parantez içinde romanize (Revize Romanizasyon) okunuş ve Türkçe çevirisini ver. Kibar/samimi seviye farkını belirt (-요 / -ㅂ니다 / banmal).",
    bcp47: "ko-KR",
  },
  {
    id: "ar",
    name: "Arapça",
    nativeName: "العربية",
    flag: "🇸🇦",
    hello: "مرحبا",
    description:
      "Sami dil ailesi. Sağdan sola yazılır. Harflerin kelime içindeki konumlarına göre 4 şekli vardır. Modern Standart Arapça (Fusha) öğrenilir; lehçeler değişir.",
    difficulty: 5,
    alphabetIntro:
      "28 harf, sağdan sola yazılır. Her harf kelimenin başında/ortada/sonunda/bağımsız 4 farklı şekil alır. Kısa ünlüler harekelerle (fetha/kesra/damme) yazılır ama günlük yazımda genelde gizlidir.",
    basics: [
      { item: "مرحبا", reading: "marhaba", translation: "Merhaba" },
      { item: "السلام عليكم", reading: "as-salāmu ʿalaykum", translation: "Selam üzerinize olsun" },
      { item: "شكرا", reading: "shukran", translation: "Teşekkürler" },
      { item: "نعم / لا", reading: "naʿam / lā", translation: "Evet / Hayır" },
      { item: "آسف / عفوا", reading: "āsif / ʿafwan", translation: "Üzgünüm / Rica ederim" },
      { item: "أنا", reading: "ana", translation: "Ben" },
      { item: "واحد، اثنان، ثلاثة", reading: "wāḥid, ithnān, thalātha", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "واحد", reading: "wāḥid", translation: "1" },
          { item: "اثنان", reading: "ithnān", translation: "2" },
          { item: "ثلاثة", reading: "thalātha", translation: "3" },
          { item: "أربعة", reading: "arbaʿa", translation: "4" },
          { item: "خمسة", reading: "khamsa", translation: "5" },
          { item: "ستة", reading: "sitta", translation: "6" },
          { item: "سبعة", reading: "sabʿa", translation: "7" },
          { item: "ثمانية", reading: "thamāniya", translation: "8" },
          { item: "تسعة", reading: "tisʿa", translation: "9" },
          { item: "عشرة", reading: "ʿashara", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "صباح الخير", reading: "ṣabāḥu l-khayr", translation: "Günaydın" },
          { item: "مساء الخير", reading: "masāʾu l-khayr", translation: "İyi akşamlar" },
          { item: "تصبح على خير", reading: "tuṣbiḥu ʿalā khayr", translation: "İyi geceler" },
          { item: "مع السلامة", reading: "maʿa s-salāma", translation: "Hoşça kal" },
          { item: "من فضلك", reading: "min faḍlik", translation: "Lütfen" },
          { item: "لا أفهم", reading: "lā afham", translation: "Anlamıyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Modern Standart Arapça (الفصحى) öğreten sabırlı bir öğretmensin. Her Arapça ifadeyi Arap harfleriyle yaz, parantez içinde Latin transkripsiyon (ALA-LC benzeri) ve Türkçe çevirisini ver. Sağdan sola yazıyı koru. Kısa ünlüleri (hareke) önemli olduğunda işaretle.",
    bcp47: "ar-SA",
  },
  {
    id: "pt",
    name: "Portekizce",
    nativeName: "Português",
    flag: "🇵🇹",
    hello: "Olá!",
    description:
      "Romantik dil; Brezilya ve Portekiz versiyonu birbirine yakın (telaffuz farkı belirgin). İspanyolcaya yakın yapı.",
    difficulty: 2,
    alphabetIntro:
      "Latin alfabesi + ã õ á é í ó ú ç. Burundan çıkan ünlüler (ã, õ) Portekizceye has. ç='s', nh='ny', lh='lyi', x bağlama göre 'ş' veya 'z'.",
    basics: [
      { item: "Olá", translation: "Merhaba" },
      { item: "Obrigado / Obrigada", translation: "Teşekkürler (erkek/kadın)" },
      { item: "Sim / Não", translation: "Evet / Hayır" },
      { item: "Desculpe", translation: "Affedersiniz" },
      { item: "Eu", translation: "Ben" },
      { item: "Chamo-me…", translation: "Adım…" },
      { item: "Um, dois, três", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "um", translation: "1" },
          { item: "dois", translation: "2" },
          { item: "três", translation: "3" },
          { item: "quatro", translation: "4" },
          { item: "cinco", translation: "5" },
          { item: "seis", translation: "6" },
          { item: "sete", translation: "7" },
          { item: "oito", translation: "8" },
          { item: "nove", translation: "9" },
          { item: "dez", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Bom dia", translation: "Günaydın" },
          { item: "Boa tarde", translation: "İyi öğleden sonralar" },
          { item: "Boa noite", translation: "İyi akşamlar / İyi geceler" },
          { item: "Adeus", translation: "Hoşça kal" },
          { item: "Por favor", translation: "Lütfen" },
          { item: "Não entendo", translation: "Anlamıyorum" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Portekizce öğreten sabırlı bir öğretmensin. Her Portekizce cümleyi yaz, Türkçe çevirisini ver. Brezilya ve Portekiz farkı varsa belirt. Cinsiyet (m/f) ekle.",
    bcp47: "pt-PT",
  },
  {
    id: "el",
    name: "Yunanca",
    nativeName: "Ελληνικά",
    flag: "🇬🇷",
    hello: "Γειά σου",
    description:
      "Hint-Avrupa dil ailesinin tek başına bir kolu. Kendine has alfabesi (Yunan alfabesi, 24 harf) modern Türk matematiği için tanıdık.",
    difficulty: 3,
    alphabetIntro:
      "Yunan alfabesi 24 harf (Α α, Β β=v, Γ γ=gh/y, Δ δ=th, Ε ε, Ζ ζ=z, Η η=i, Θ θ=th, Ι ι, ...). Tonos (΄) işareti vurguyu gösterir.",
    basics: [
      { item: "Γειά σου", reading: "ya su", translation: "Merhaba (samimi)" },
      { item: "Καλημέρα", reading: "kalimera", translation: "Günaydın" },
      { item: "Ευχαριστώ", reading: "efharisto", translation: "Teşekkürler" },
      { item: "Ναι / Όχι", reading: "ne / ohi", translation: "Evet / Hayır" },
      { item: "Συγγνώμη", reading: "signomi", translation: "Affedersiniz" },
      { item: "Εγώ", reading: "egho", translation: "Ben" },
      { item: "Ένα, δύο, τρία", reading: "ena, dhio, tria", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "ένα", reading: "ena", translation: "1" },
          { item: "δύο", reading: "dhio", translation: "2" },
          { item: "τρία", reading: "tria", translation: "3" },
          { item: "τέσσερα", reading: "tessera", translation: "4" },
          { item: "πέντε", reading: "pende", translation: "5" },
          { item: "έξι", reading: "exi", translation: "6" },
          { item: "επτά", reading: "epta", translation: "7" },
          { item: "οκτώ", reading: "okto", translation: "8" },
          { item: "εννιά", reading: "ennia", translation: "9" },
          { item: "δέκα", reading: "dheka", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Καλησπέρα", reading: "kalispera", translation: "İyi akşamlar" },
          { item: "Καληνύχτα", reading: "kalinihta", translation: "İyi geceler" },
          { item: "Αντίο", reading: "andio", translation: "Hoşça kal" },
          { item: "Παρακαλώ", reading: "parakalo", translation: "Lütfen / Rica ederim" },
          { item: "Δεν καταλαβαίνω", reading: "dhen katalaveno", translation: "Anlamıyorum" },
          { item: "Τι κάνεις;", reading: "ti kanis", translation: "Nasılsın?" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Modern Yunanca öğreten sabırlı bir öğretmensin. Her Yunanca cümleyi Yunan alfabesiyle yaz, parantez içinde Latin transkripsiyon ve Türkçe çevirisini ver. Vurguyu (tonos) doğru göster.",
    bcp47: "el-GR",
  },
  {
    id: "pl",
    name: "Lehçe",
    nativeName: "Polski",
    flag: "🇵🇱",
    hello: "Cześć",
    description:
      "Batı Slav dili. Yedi durum (case) sistemi, zengin ünsüz kümeleri (ör. cz, sz, rz). Latin alfabesi + diakritik harfler.",
    difficulty: 4,
    alphabetIntro:
      "Latin alfabesi + ą ć ę ł ń ó ś ź ż. cz='ç', sz='ş', dz='dz', rz='j', ł='w'. Vurgu çoğunlukla sondan bir önceki hecede. Vurgu kuralı düzenli.",
    basics: [
      { item: "Cześć", reading: "çeşç", translation: "Selam" },
      { item: "Dzień dobry", reading: "cyen dobri", translation: "Günaydın / Merhaba (resmi)" },
      { item: "Dziękuję", reading: "cyenkuye", translation: "Teşekkürler" },
      { item: "Tak / Nie", reading: "tak / nye", translation: "Evet / Hayır" },
      { item: "Przepraszam", reading: "psheprasham", translation: "Affedersiniz" },
      { item: "Ja", reading: "ya", translation: "Ben" },
      { item: "Jeden, dwa, trzy", reading: "yeden, dva, tşi", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "jeden", reading: "yeden", translation: "1" },
          { item: "dwa", reading: "dva", translation: "2" },
          { item: "trzy", reading: "tşi", translation: "3" },
          { item: "cztery", reading: "çteri", translation: "4" },
          { item: "pięć", reading: "pyenç", translation: "5" },
          { item: "sześć", reading: "şeşç", translation: "6" },
          { item: "siedem", reading: "şedem", translation: "7" },
          { item: "osiem", reading: "oşem", translation: "8" },
          { item: "dziewięć", reading: "cyevyenç", translation: "9" },
          { item: "dziesięć", reading: "cyeşenç", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "Dobry wieczór", reading: "dobri vyeçur", translation: "İyi akşamlar" },
          { item: "Dobranoc", reading: "dobranots", translation: "İyi geceler" },
          { item: "Do widzenia", reading: "do vidzenya", translation: "Hoşça kal" },
          { item: "Proszę", reading: "proşe", translation: "Lütfen / Rica ederim" },
          { item: "Nie rozumiem", reading: "nye rozumyem", translation: "Anlamıyorum" },
          { item: "Jak się masz?", reading: "yak şe maş", translation: "Nasılsın?" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Lehçe öğreten sabırlı bir öğretmensin. Her Lehçe cümleyi yaz, parantez içinde basitleştirilmiş okunuş ve Türkçe çevirisini ver. Durum (case) bilgisini gerektiğinde kısaca belirt. ą ę ł ó ś ź ż karakterlerini doğru kullan.",
    bcp47: "pl-PL",
  },
  {
    id: "sv",
    name: "İsveççe",
    nativeName: "Svenska",
    flag: "🇸🇪",
    hello: "Hej!",
    description:
      "Kuzey Germen dili. Telaffuzu özel (sj-, sk- gibi sesler), gramer Almancadan basit. İki cinsiyet (en/ett).",
    difficulty: 3,
    alphabetIntro:
      "Latin alfabesi + å ä ö (alfabenin sonunda). sj/skj/stj 'ş'a yakın özel ses, k+e/i 'ş', j başta 'y'. Vurgu çoğunlukla ilk hecede + ezgili (tonal).",
    basics: [
      { item: "Hej", translation: "Selam" },
      { item: "Tack", translation: "Teşekkürler" },
      { item: "Ja / Nej", translation: "Evet / Hayır" },
      { item: "Förlåt", translation: "Affedersiniz" },
      { item: "Jag", translation: "Ben" },
      { item: "Jag heter…", translation: "Adım…" },
      { item: "Ett, två, tre", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "ett", translation: "1" },
          { item: "två", translation: "2" },
          { item: "tre", translation: "3" },
          { item: "fyra", translation: "4" },
          { item: "fem", translation: "5" },
          { item: "sex", translation: "6" },
          { item: "sju", translation: "7" },
          { item: "åtta", translation: "8" },
          { item: "nio", translation: "9" },
          { item: "tio", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "God morgon", translation: "Günaydın" },
          { item: "God kväll", translation: "İyi akşamlar" },
          { item: "God natt", translation: "İyi geceler" },
          { item: "Hej då", translation: "Hoşça kal" },
          { item: "Snälla / Vänligen", translation: "Lütfen" },
          { item: "Jag förstår inte", translation: "Anlamıyorum" },
          { item: "Hur mår du?", translation: "Nasılsın?" },
        ],
      },
    ],
    aiSystemHint:
      "Sen İsveççe öğreten sabırlı bir öğretmensin. Her İsveççe cümleyi yaz, Türkçe çevirisini ver. İsimlere artikel (en/ett) ekle, çoğul ekleri kısaca belirt. å ä ö karakterlerini doğru kullan.",
    bcp47: "sv-SE",
  },
  {
    id: "hi",
    name: "Hintçe",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    hello: "नमस्ते",
    description:
      "Hint-Aryan dil ailesi. Devanagari yazı sistemi (heceli alfabe). SOV yapısı. Urdu ile konuşma dilinde benzer.",
    difficulty: 4,
    alphabetIntro:
      "Devanagari: 11 ünlü + 33 ünsüz, hece bloklarına dizilir. Kelimelerin üstünde yatay çizgi (शिरोरेखा). Türkçe gibi büyük ölçüde fonetik yazılır.",
    basics: [
      { item: "नमस्ते", reading: "namaste", translation: "Merhaba (saygılı)" },
      { item: "धन्यवाद", reading: "dhanyavaad", translation: "Teşekkürler" },
      { item: "हाँ / नहीं", reading: "haan / nahin", translation: "Evet / Hayır" },
      { item: "माफ़ कीजिए", reading: "maaf kijiye", translation: "Affedersiniz" },
      { item: "मैं", reading: "main", translation: "Ben" },
      { item: "मेरा नाम…", reading: "mera naam…", translation: "Adım…" },
      { item: "एक, दो, तीन", reading: "ek, do, tin", translation: "Bir, iki, üç" },
    ],
    units: [
      {
        title: "Sayılar 1-10",
        phrases: [
          { item: "एक", reading: "ek", translation: "1" },
          { item: "दो", reading: "do", translation: "2" },
          { item: "तीन", reading: "tin", translation: "3" },
          { item: "चार", reading: "char", translation: "4" },
          { item: "पाँच", reading: "panch", translation: "5" },
          { item: "छह", reading: "chhah", translation: "6" },
          { item: "सात", reading: "saat", translation: "7" },
          { item: "आठ", reading: "aath", translation: "8" },
          { item: "नौ", reading: "nau", translation: "9" },
          { item: "दस", reading: "das", translation: "10" },
        ],
      },
      {
        title: "Günlük ifadeler",
        phrases: [
          { item: "सुप्रभात", reading: "suprabhaat", translation: "Günaydın" },
          { item: "शुभ रात्रि", reading: "shubh raatri", translation: "İyi geceler" },
          { item: "अलविदा", reading: "alvida", translation: "Hoşça kal" },
          { item: "कृपया", reading: "kripaya", translation: "Lütfen" },
          { item: "मुझे समझ नहीं आया", reading: "mujhe samajh nahin aaya", translation: "Anlamıyorum" },
          { item: "आप कैसे हैं?", reading: "aap kaise hain", translation: "Nasılsınız?" },
        ],
      },
    ],
    aiSystemHint:
      "Sen Hintçe öğreten sabırlı bir öğretmensin. Her Hintçe cümleyi Devanagari ile yaz, parantez içinde basitleştirilmiş okunuş ve Türkçe çevirisini ver. Cinsiyet (m/f) ve fiil çekimini kısaca belirt.",
    bcp47: "hi-IN",
  },
];

// Dile özel ücretsiz kaynaklar (hand-curated). Telifsiz/kamu hizmeti tercihi.
const RESOURCES: Partial<Record<LanguageId, LanguageResource[]>> = {
  ja: [
    { title: "NHK Easy Japanese News", url: "https://www3.nhk.or.jp/news/easy/", note: "Kamu yayıncısı NHK — kolay Japonca haberler" },
    { title: "Tofugu", url: "https://www.tofugu.com/", note: "Ücretsiz Japonca öğrenme makaleleri" },
  ],
  zh: [
    { title: "Arch Chinese", url: "https://www.archchinese.com/", note: "Ücretsiz karakter sözlüğü + çizim sırası" },
  ],
  fr: [
    { title: "TV5MONDE Apprendre", url: "https://apprendre.tv5monde.com/", note: "Devlet destekli ücretsiz Fransızca öğrenme platformu" },
    { title: "Lawless French", url: "https://www.lawlessfrench.com/", note: "Geniş ücretsiz dilbilgisi kaynağı" },
  ],
  ru: [
    { title: "Master Russian", url: "http://masterrussian.com/", note: "Ücretsiz dilbilgisi/sözlük" },
  ],
  es: [
    { title: "RAE — İspanyol Kraliyet Akademisi Sözlüğü", url: "https://dle.rae.es/", note: "Resmi ücretsiz İspanyolca sözlük" },
  ],
  de: [
    { title: "Deutsche Welle — Deutsch Lernen", url: "https://learngerman.dw.com/", note: "Devlet yayıncısı DW — A1'den C'ye ücretsiz kurslar" },
  ],
  it: [
    { title: "Treccani", url: "https://www.treccani.it/vocabolario/", note: "İtalyan ulusal ansiklopedi/sözlük" },
  ],
  ko: [
    { title: "Talk To Me In Korean", url: "https://talktomeinkorean.com/", note: "Geniş ücretsiz Korece müfredatı" },
  ],
  ar: [
    { title: "Madinah Arabic", url: "https://www.madinaharabic.com/", note: "Ücretsiz klasik Arapça kursu" },
  ],
  pt: [
    { title: "RTP Ensina — Português", url: "https://ensina.rtp.pt/", note: "Portekiz devlet yayıncısı eğitim arşivi" },
  ],
  el: [
    { title: "Centre for the Greek Language", url: "https://www.greek-language.gr/", note: "Yunan devlet kurumu — ücretsiz Modern Yunanca" },
  ],
  pl: [
    { title: "Polski.pl (Polonyalı dilbilgisi)", url: "https://polski.pl/", note: "Genel referans" },
  ],
  sv: [
    { title: "Lär dig svenska — UR.se", url: "https://urplay.se/program/serie/svenska-for-dig", note: "İsveç devlet yayıncısı UR — ücretsiz İsveççe öğrenme" },
  ],
  hi: [
    { title: "BBC Hindi", url: "https://www.bbc.com/hindi", note: "Günlük basit Hintçe haber metinleri" },
  ],
};

// Tüm dillere uygulanan jenerik ücretsiz kaynaklar (Wikipedia, Wiktionary, Forvo).
export function defaultResources(lang: Language): LanguageResource[] {
  const code = lang.bcp47.split("-")[0]!;
  const wikiSlug = lang.wikiSlug ?? lang.name.replaceAll(" ", "_");
  return [
    {
      title: `Vikipedi — ${lang.name}`,
      url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`,
      note: "Dil hakkında Türkçe genel bilgi (CC BY-SA)",
    },
    {
      title: `Wiktionary — ${lang.name} sözlüğü`,
      url: `https://${code}.wiktionary.org/`,
      note: "Topluluk sözlüğü (CC BY-SA)",
    },
    {
      title: `Forvo — Telaffuz`,
      url: `https://forvo.com/languages/${code}/`,
      note: "Ana dilden ücretsiz telaffuz örnekleri",
    },
  ];
}

export function languageResources(lang: Language): LanguageResource[] {
  return [...(RESOURCES[lang.id] ?? []), ...defaultResources(lang)];
}

export function languageById(id: string) {
  return languages.find((l) => l.id === id);
}
