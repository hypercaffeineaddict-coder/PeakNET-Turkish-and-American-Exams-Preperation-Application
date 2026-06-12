# Read the file
with open('src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Build the correct TR tools section
tools_tr = '''    tools: {
      pageTitle: "YKS Araçları · PeakNET",
      title: "YKS Araçları",
      subtitle: "Net hesapla, tahmini puanını ve sıralamanı gör, hedefin için gereken neti öğren.",
      quickNet: {
        title: "Hızlı net hesabı (tek test / branda)",
        description: "Standart YKS dışı bir testin (GİS, branda, mini sınav) netini anında hesapla. <strong>Net = D − Y/4</strong>. Soru sayısı opsiyonel.",
        totalLabel: "Soru sayısı (ops.)",
        correctLabel: "Doğru",
        wrongLabel: "Yanlış",
        netLabel: "Net",
        emptyLabel: "Boş",
        accuracyLabel: "İsabet",
        invalid: "geçersiz",
      },
      scoreTypes: {
        say: "SAY",
        ea: "EA",
        soz: "SÖZ",
        tyd: "TYT",
      },
      table: {
        subject: "Ders",
        correct: "Doğru",
        wrong: "Yanlış",
        net: "Net",
        totalNet: "Toplam net",
      },
      results: {
        title: "Tahmini sonuç",
        totalNet: "Toplam net",
        estimatedScore: "Tahmini puan",
        estimatedRank: "Tahmini sıralama",
      },
      target: {
        title: "Hedef analizi",
        targetRankLabel: "Hedef sıralaman",
        targetRankPlaceholder: "örn. 5000",
        requiredScore: "Gereken puan",
        difference: "Fark",
        onTrack: "Bu tempoyla hedefe ulaşıyorsun!",
      },
      disclaimer: "Puan ve sıralama değerleri geçmiş yıl eğilimlerine dayalı <strong>kaba tahminlerdir</strong>; ÖSYM&#39;nin gerçek standart puan hesabı dışarıdan birebir yapılamaz. Kesin tercih kararı için güncel YÖK Atlas ve ÖSYM verilerini kullan. OBP/diploma katkısı bu hesaba dahil değildir.",
    },'''

# Find the TR locale end (the "  }," that closes tr: { before "  en: {")
tr_end = content.find('  },\n  en: {')
if tr_end == -1:
    print("Could not find TR locale end")
    exit(1)

# Find drawingBoard in TR locale (last "    }," before TR end)
drawing_board_end = content.rfind('    },', 0, tr_end)
if drawing_board_end == -1:
    print("Could not find drawingBoard end")
    exit(1)

# Check if tools already exists between drawingBoard and TR end
section_between = content[drawing_board_end:tr_end]
if 'tools:' in section_between:
    # Replace existing tools section
    tools_start = content.find('tools: {', drawing_board_end, tr_end)
    tools_end = content.find('    },', tools_start, tr_end)
    if tools_end != -1:
        tools_end += 4  # include the "    },"
        content = content[:tools_start] + tools_tr + content[tools_end:]
        print("Replaced existing tools section")
    else:
        print("Could not find tools end")
        exit(1)
else:
    # Insert after drawingBoard
    insert_pos = drawing_board_end + 4  # after "    },"
    content = content[:insert_pos] + '\n' + tools_tr + content[insert_pos:]
    print("Inserted new tools section")

# Write back
with open('src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("TR locale tools section fixed!")