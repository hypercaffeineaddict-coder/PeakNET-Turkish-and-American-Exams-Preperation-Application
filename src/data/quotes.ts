export type Quote = {
  text: string;
  author: string;
  detail?: string;
};

export const quotes: Quote[] = [
  { text: "Hayatta en hakiki mürşit ilimdir.", author: "Mustafa Kemal Atatürk" },
  { text: "Öğretmenler, yeni nesil sizin eseriniz olacaktır.", author: "Mustafa Kemal Atatürk" },
  { text: "Matematik, bir gün herkesin diline tercüme edilecektir.", author: "Cahit Arf", detail: "Türk matematikçi" },
  { text: "Bilim, sınır tanımaz.", author: "Aziz Sancar", detail: "Nobel ödüllü biyokimyager" },
  { text: "Hayal gücü, bilgiden daha önemlidir.", author: "Albert Einstein" },
  { text: "Önemli olan sormaya devam etmektir.", author: "Albert Einstein" },
  { text: "Hayatta hiçbir şeyden korkulmaz, sadece anlaşılır.", author: "Marie Curie", detail: "Çift Nobel sahibi" },
  { text: "Devler omuzlarına çıkarak daha uzağı görebildim.", author: "Isaac Newton" },
  { text: "Öğrenmenin hiçbir yaşı yoktur.", author: "Leonardo da Vinci" },
  { text: "Bugünü dolu yaşamayan, yarını ziyan eder.", author: "İbn Sina", detail: "Bilim insanı, hekim" },
  { text: "Bilgi insanın kendisini tanımasıyla başlar.", author: "Sokrates" },
  { text: "Bir şeyi başarmanın tek yolu, denemeye devam etmektir.", author: "Thomas Edison" },
  { text: "Geleceği tahmin etmenin en iyi yolu onu icat etmektir.", author: "Alan Kay", detail: "Bilgisayar bilimcisi" },
  { text: "Disiplin, hedef ile başarı arasındaki köprüdür.", author: "Jim Rohn" },
  { text: "Çalışmadan, öğrenmeden, yorulmadan rahat yaşamak isteyenler için yer yoktur.", author: "Mustafa Kemal Atatürk" },
  { text: "Anlamak, ezberlemekten kıymetlidir.", author: "Richard Feynman", detail: "Nobel ödüllü fizikçi" },
  { text: "Evren, anlaşılmayı bekleyen güzel bir bulmacadır.", author: "Carl Sagan" },
  { text: "Zorluk, zaferin tadını arttırır.", author: "Seneca" },
  { text: "Yapamayacağını düşündüğün şey, asıl yapman gerekendir.", author: "Eleanor Roosevelt" },
  { text: "Küçük günlük gelişmeler büyük sonuçlar doğurur.", author: "Robin Sharma" },
];

export function quoteOfTheDay(seed?: number) {
  const day = seed ?? Math.floor(Date.now() / 86_400_000);
  return quotes[day % quotes.length];
}
