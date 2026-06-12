# Read the file
with open('src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Build tools sections for all 4 locales
tools_tr = [
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

tools_en = [
    '    tools: {\n',
    '      pageTitle: "YKS Tools · PeakNET",\n',
    '      title: "YKS Tools",\n',
    '      subtitle: "Calculate net, see estimated score & ranking, learn required net for your target.",\n',
    '      quickNet: {\n',
    '        title: "Quick net (single test / brand)",\n',
    '        description: "Instantly calculate net for non-standard YKS tests (GİS, brand, mini). <strong>Net = D − Y/4</strong>. Question count optional.",\n',
    '        totalLabel: "Q count (opt.)",\n',
    '        correctLabel: "Correct",\n',
    '        wrongLabel: "Wrong",\n',
    '        netLabel: "Net",\n',
    '        emptyLabel: "Blank",\n',
    '        accuracyLabel: "Accuracy",\n',
    '        invalid: "invalid",\n',
    '      },\n',
    '      scoreTypes: {\n',
    '        say: "SAY",\n',
    '        ea: "EA",\n',
    '        soz: "VERBAL",\n',
    '        tyd: "TYT",\n',
    '      },\n',
    '      table: {\n',
    '        subject: "Subject",\n',
    '        correct: "Correct",\n',
    '        wrong: "Wrong",\n',
    '        net: "Net",\n',
    '        totalNet: "Total net",\n',
    '      },\n',
    '      results: {\n',
    '        title: "Estimated result",\n',
    '        totalNet: "Total net",\n',
    '        estimatedScore: "Estimated score",\n',
    '        estimatedRank: "Estimated rank",\n',
    '      },\n',
    '      target: {\n',
    '        title: "Target analysis",\n',
    '        targetRankLabel: "Your target rank",\n',
    '        targetRankPlaceholder: "e.g. 5000",\n',
    '        requiredScore: "Required score",\n',
    '        difference: "Difference",\n',
    '        onTrack: "You\\'re on track to hit your target!",\n',
    '      },\n',
    '      disclaimer: "Scores and ranks are <strong>rough estimates</strong> based on past trends; ÖSYM\\'s exact formula cannot be replicated. For final decisions, use current YÖK Atlas and ÖSYM data. OBP/diploma not included.",\n',
    '    },\n'
]

tools_de = [
    '    tools: {\n',
    '      pageTitle: "YKS-Tools · PeakNET",\n',
    '      title: "YKS-Tools",\n',
    '      subtitle: "Net berechnen, geschätzten Score & Rang sehen, nötiges Net für Ziel erfahren.",\n',
    '      quickNet: {\n',
    '        title: "Schnelles Net (Einzeltest / Brand)",\n',
    '        description: "Net für nicht-standard YKS-Tests (GİS, Brand, Mini) sofort berechnen. <strong>Net = R − F/4</strong>. Aufgabenanzahl optional.",\n',
    '        totalLabel: "Aufg.-Anzahl (opt.)",\n',
    '        correctLabel: "Richtig",\n',
    '        wrongLabel: "Falsch",\n',
    '        netLabel: "Net",\n',
    '        emptyLabel: "Leer",\n',
    '        accuracyLabel: "Trefferquote",\n',
    '        invalid: "ungültig",\n',
    '      },\n',
    '      scoreTypes: {\n',
    '        say: "SAY",\n',
    '        ea: "EA",\n',
    '        soz: "SÖZ",\n',
    '        tyd: "TYT",\n',
    '      },\n',
    '      table: {\n',
    '        subject: "Fach",\n',
    '        correct: "Richtig",\n',
    '        wrong: "Falsch",\n',
    '        net: "Net",\n',
    '        totalNet: "Gesamt-Net",\n',
    '      },\n',
    '      results: {\n',
    '        title: "Geschätztes Ergebnis",\n',
    '        totalNet: "Gesamt-Net",\n',
    '        estimatedScore: "Geschätzter Score",\n',
    '        estimatedRank: "Geschätzter Rang",\n',
    '      },\n',
    '      target: {\n',
    '        title: "Zielanalyse",\n',
    '        targetRankLabel: "Dein Zielrang",\n',
    '        targetRankPlaceholder: "z. B. 5000",\n',
    '        requiredScore: "Benötigter Score",\n',
    '        difference: "Differenz",\n',
    '        onTrack: "Du bist auf Kurs für dein Ziel!",\n',
    '      },\n',
    '      disclaimer: "Scores und Ränge sind <strong>grobe Schätzungen</strong> basierend auf Vorjahren; die exakte ÖSYM-Formel ist nicht nachbildbar. Für finale Entscheidungen aktuelle YÖK Atlas & ÖSYM Daten nutzen. OBP/Diploma nicht enthalten.",\n',
    '    },\n'
]

tools_ar = [
    '    tools: {\n',
    '      pageTitle: "أدوات YKS · PeakNET",\n',
    '      title: "أدوات YKS",\n',
    '      subtitle: "احسب النقاط، واعرض التقديرات للنتيجة والترتيب، وتعرف على النقاط المطلوبة لهدفك.",\n',
    '      quickNet: {\n',
    '        title: "حساب سريع للنقاط (اختبار منفرد / تجريب)",\n',
    '        description: "احسب نقاط الاختبارات غير القياسية لـ YKS (GİS، علامة تجارية، مصغر) فورًا. <strong>النقاط = ص − خ/4</strong>. عدد الأسئلة اختياري.",\n',
    '        totalLabel: "عدد الأسئلة (اختياري)",\n',
    '        correctLabel: "صحيح",\n',
    '        wrongLabel: "خطأ",\n',
    '        netLabel: "النقاط",\n',
    '        emptyLabel: "متروك",\n',
    '        accuracyLabel: "دقة",\n',
    '        invalid: "غير صالح",\n',
    '      },\n',
    '      scoreTypes: {\n',
    '        say: "SAY",\n',
    '        ea: "EA",\n',
    '        soz: "سوزيل",\n',
    '        tyd: "TYT",\n',
    '      },\n',
    '      table: {\n',
    '        subject: "المادة",\n',
    '        correct: "صحيح",\n',
    '        wrong: "خطأ",\n',
    '        net: "النقاط",\n',
    '        totalNet: "إجمالي النقاط",\n',
    '      },\n',
    '      results: {\n',
    '        title: "النتيجة التقديرية",\n',
    '        totalNet: "إجمالي النقاط",\n',
    '        estimatedScore: "النتيجة التقديرية",\n',
    '        estimatedRank: "الترتيب التقديري",\n',
    '      },\n',
    '      target: {\n',
    '        title: "تحليل الهدف",\n',
    '        targetRankLabel: "ترتيبك المستهدف",\n',
    '        targetRankPlaceholder: "مثال 5000",\n',
    '        requiredScore: "الدرجة المطلوبة",\n',
    '        difference: "الفرق",\n',
    '        onTrack: "أنت على الطريق الصحيح لتحقيق هدفك!",\n',
    '      },\n',
    '      disclaimer: "الدرجات والترتيبات <strong>تقديرات تقريبية</strong> بناءً على الاتجاهات السابقة؛ لا يمكن استنساخ صيغة ÖSYM الدقيقة. للقرارات النهائية، استخدم YÖK Atlas وÖSYM الحاليين. OBP/الدبلوم غير مشمول.",\n',
    '    },\n'
]

# Process each locale: find drawingBoard in each and insert tools after it
# We'll work backwards to maintain line numbers
locales = [
    ('ar', tools_ar, 1474),  # AR drawingBoard at line 1474 (~1473 0-indexed)
    ('de', tools_de, 1127),  # DE drawingBoard at line 1127
    ('en', tools_en, 780),   # EN drawingBoard at line 780
    ('tr', tools_tr, 385),   # TR drawingBoard at line 385 (already done, but re-verify)
]

for locale_name, tools_lines, drawing_board_line in locales:
    # Convert to 0-indexed
    db_idx = drawing_board_line - 1
    
    # Find the closing "    }," of drawingBoard after this line
    insert_idx = None
    for i in range(db_idx + 1, len(lines)):
        if lines[i].strip() == '},':
            # Check if next non-empty line is not part of drawingBoard
            # We'll use the second "    }," after drawingBoard start
            pass
    
    # Simpler: find the "    }," that closes drawingBoard (2nd one after drawingBoard: {)
    brace_count = 0
    for i in range(db_idx, len(lines)):
        stripped = lines[i].strip()
        if stripped.startswith('drawingBoard:'):
            brace_count = 0
        if '{' in stripped:
            brace_count += stripped.count('{')
        if '}' in stripped:
            brace_count -= stripped.count('}')
            if brace_count == 0:
                insert_idx = i + 1  # after the closing brace
                break
    
    if insert_idx is not None:
        # Check if tools already exists
        has_tools = False
        for i in range(insert_idx, min(insert_idx + 50, len(lines))):
            if 'tools:' in lines[i]:
                has_tools = True
                # Find end of existing tools
                end_idx = None
                for j in range(i, len(lines)):
                    if lines[j].strip() == '},':
                        end_idx = j + 1
                        break
                if end_idx:
                    lines = lines[:i] + tools_lines + lines[end_idx:]
                    print(f"Replaced {locale_name} tools at lines {i}-{end_idx}")
                break
        
        if not has_tools:
            lines = lines[:insert_idx] + tools_lines + lines[insert_idx:]
            print(f"Inserted {locale_name} tools at line {insert_idx}")
    else:
        print(f"Could not find insert point for {locale_name}")

# Write back
with open('src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("All locales processed!")