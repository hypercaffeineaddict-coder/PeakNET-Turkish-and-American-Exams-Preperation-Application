export type Language = {
  id: "ja" | "zh" | "fr" | "ru";
  name: string;
  nativeName: string;
  flag: string;
  hello: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  basics: { item: string; reading?: string; translation: string }[];
  alphabetIntro: string;
  aiSystemHint: string;
  bcp47: string; // Web Speech API için
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
      "Romantic dil ailesinden. Cinsiyetli isimler (le/la), zengin fiil çekimleri.",
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
    aiSystemHint:
      "Sen Rusça öğreten sabırlı bir öğretmensin. Her Rusça cümleyi Kiril alfabesiyle yaz, parantez içinde Latin transkripsiyon ve Türkçe çevirisini ver. Vurgulu heceyi büyük harfle göster (ör. priVET).",
    bcp47: "ru-RU",
  },
];

export function languageById(id: string) {
  return languages.find((l) => l.id === id);
}
