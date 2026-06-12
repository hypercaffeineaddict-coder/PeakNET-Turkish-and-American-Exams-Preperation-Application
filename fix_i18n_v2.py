# Read the file
with open('src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The tools section starts at line ~411 (0-indexed: 410) and ends before en: at line ~434
# Find the exact lines
tools_start = None
en_start = None

for i, line in enumerate(lines):
    if 'tools: {' in line and tools_start is None:
        tools_start = i
    if 'en: {' in line and en_start is None:
        en_start = i
        break

print(f"tools_start: {tools_start}, en_start: {en_start}")

if tools_start is not None and en_start is not None:
    # Build the clean tools section
    tools_lines = [
        '    tools: {\n',
        '      pageTitle: "YKS Araçları · PeakNET",\n',
        '      title: "YKS Araçları",\n',
        '      subtitle: "Net hesapla, tahmini puanını ve sıralamanı gör, hedefin için gereken neti öğren.",\n',
        '      quickNet: {\n',
        '        title: "Hızlı net hesabı (tek test / branda)",\n',
        '        description: "Standart YKS dışı bir testin (GİS, branda, mini sınav) netini anında hesapla. <strong>Net = D − Y/4</strong>. Soru sayısı opsiyonel.",\n',
        '        totalLabel: "Soru sayısı (ops.)",\n',
        '        correctLabel: "Doğru",\n',
        '        wrongLabel: "Yanlış",\n',
        '        netLabel: "Net",\n',
        '        emptyLabel: "Boş",\n',
        '        accuracyLabel: "İsabet",\n',
        '        invalid: "geçersiz",\n',
        '      },\n',
        '      scoreTypes: {\n',
        '        say: "SAY",\n',
        '        ea: "EA",\n',
        '        soz: "SÖZ",\n',
        '        tyd: "TYT",\n',
        '      },\n',
        '      table: {\n',
        '        subject: "Ders",\n',
        '        correct: "Doğru",\n',
        '        wrong: "Yanlış",\n',
        '        net: "Net",\n',
        '        totalNet: "Toplam net",\n',
        '      },\n',
        '      results: {\n',
        '        title: "Tahmini sonuç",\n',
        '        totalNet: "Toplam net",\n',
        '        estimatedScore: "Tahmini puan",\n',
        '        estimatedRank: "Tahmini sıralama",\n',
        '      },\n',
        '      target: {\n',
        '        title: "Hedef analizi",\n',
        '        targetRankLabel: "Hedef sıralaman",\n',
        '        targetRankPlaceholder: "örn. 5000",\n',
        '        requiredScore: "Gereken puan",\n',
        '        difference: "Fark",\n',
        '        onTrack: "Bu tempoyla hedefe ulaşıyorsun!",\n',
        '      },\n',
        '      disclaimer: "Puan ve sıralama değerleri geçmiş yıl eğilimlerine dayalı <strong>kaba tahminlerdir</strong>; ÖSYM&#39;nin gerçek standart puan hesabı dışarıdan birebir yapılamaz. Kesin tercih kararı için güncel YÖK Atlas ve ÖSYM verilerini kullan. OBP/diploma katkısı bu hesaba dahil değildir.",\n',
        '    },\n'
    ]
    
    # Replace lines[tools_start:en_start] with tools_lines
    new_lines = lines[:tools_start] + tools_lines + lines[en_start:]
    
    with open('src/lib/i18n.ts', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Replaced lines {tools_start} to {en_start-1} with clean tools section")
else:
    print("Could not find tools_start or en_start")
    print(f"tools_start: {tools_start}")
    print(f"en_start: {en_start}")

print("Done!")