
-- Update topics table
UPDATE public.topics SET name = REPLACE(name, 'TǬrke', 'Türkçe');
UPDATE public.topics SET name = REPLACE(name, 'CǬmlede Anlam', 'Cümlede Anlam');
UPDATE public.topics SET name = REPLACE(name, 'SzcǬkte Anlam', 'Sözcükte Anlam');
UPDATE public.topics SET name = REPLACE(name, 'Anlatm BozukluYu', 'Anlatım Bozukluğu');
UPDATE public.topics SET name = REPLACE(name, 'Yazm Kurallar', 'Yazım Kuralları');
UPDATE public.topics SET name = REPLACE(name, 'Noktalama Yaretleri', 'Noktalama İşaretleri');
UPDATE public.topics SET name = REPLACE(name, 'SzcǬkte Yap', 'Sözcükte Yapı');
UPDATE public.topics SET name = REPLACE(name, 'SzcǬk TǬrleri', 'Sözcük Türleri');
UPDATE public.topics SET name = REPLACE(name, 'CǬmlenin -geleri', 'Cümlenin Ögeleri');
UPDATE public.topics SET name = REPLACE(name, 'Fiilde at', 'Fiilde Çatı');
UPDATE public.topics SET name = REPLACE(name, 'Fiilde Kip ve KiYi', 'Fiilde Kip ve Kişi');
UPDATE public.topics SET name = REPLACE(name, 'CǬmle TǬrleri', 'Cümle Türleri');
UPDATE public.topics SET name = REPLACE(name, 'gǬvenliYi', 'güvenliği');
UPDATE public.topics SET name = REPLACE(name, 'canl', 'canlı');
UPDATE public.topics SET name = REPLACE(name, 'konular', 'konuları');
UPDATE public.topics SET name = REPLACE(name, 'TǬrk', 'Türk');
UPDATE public.topics SET name = REPLACE(name, 'Yrenciler', 'öğrenciler');
UPDATE public.topics SET name = REPLACE(name, 'at', 'Çatı');
UPDATE public.topics SET name = REPLACE(name, 'CǬmle', 'Cümle');
UPDATE public.topics SET name = REPLACE(name, 'SzcǬk', 'Sözcük');
UPDATE public.topics SET name = REPLACE(name, '-geleri', 'Ögeleri');
UPDATE public.topics SET name = REPLACE(name, 'KiYi', 'Kişi');
UPDATE public.topics SET name = REPLACE(name, 'Anlatm', 'Anlatım');
UPDATE public.topics SET name = REPLACE(name, 'BozukluYu', 'Bozukluğu');
UPDATE public.topics SET name = REPLACE(name, 'Yazm', 'Yazım');
UPDATE public.topics SET name = REPLACE(name, 'Kurallar', 'Kuralları');
UPDATE public.topics SET name = REPLACE(name, 'Yaretleri', 'İşaretleri');
UPDATE public.topics SET name = REPLACE(name, 'Yap', 'Yapı');
UPDATE public.topics SET name = REPLACE(name, 'TǬrleri', 'Türleri');
UPDATE public.topics SET name = REPLACE(name, 'TǬrkiye', 'Türkiye');
UPDATE public.topics SET name = REPLACE(name, 'alYmalar', 'Çalışmaları');
UPDATE public.topics SET name = REPLACE(name, 'I. DǬnya SavaY', 'I. Dünya Savaşı');
UPDATE public.topics SET name = REPLACE(name, 'XX. YǬzyl', 'XX. Yüzyıl');
UPDATE public.topics SET name = REPLACE(name, 'alYma', 'Çalışma');
UPDATE public.topics SET name = REPLACE(name, 'ǬslǬ', 'Üslü');
UPDATE public.topics SET name = REPLACE(name, 'KklǬ', 'Köklü');
UPDATE public.topics SET name = REPLACE(name, 'Fonksiyonlar', 'Fonksiyonlar');

-- Also catch standard missing characters if they're stored as generic tokens
UPDATE public.topics SET name = REPLACE(name, 'Ǭ', 'ü');
UPDATE public.topics SET name = REPLACE(name, 'Y', 'ş');

-- Update subjects table
UPDATE public.subjects SET name = REPLACE(name, 'TǬrke', 'Türkçe');
UPDATE public.subjects SET name = REPLACE(name, 'TǬrk', 'Türk');
UPDATE public.subjects SET name = REPLACE(name, 'Ǭ', 'ü');
UPDATE public.subjects SET name = REPLACE(name, 'Y', 'ş');


