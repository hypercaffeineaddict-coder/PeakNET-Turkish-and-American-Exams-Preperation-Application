# Read the file
with open('src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Build tools sections for all 4 locales (properly escaped)
tools_tr = """    tools: {
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
    },"""

tools_en = """    tools: {
      pageTitle: "YKS Tools · PeakNET",
      title: "YKS Tools",
      subtitle: "Calculate net, see estimated score & ranking, learn required net for your target.",
      quickNet: {
        title: "Quick net (single test / brand)",
        description: "Instantly calculate net for non-standard YKS tests (GİS, brand, mini). <strong>Net = D − Y/4</strong>. Question count optional.",
        totalLabel: "Q count (opt.)",
        correctLabel: "Correct",
        wrongLabel: "Wrong",
        netLabel: "Net",
        emptyLabel: "Blank",
        accuracyLabel: "Accuracy",
        invalid: "invalid",
      },
      scoreTypes: {
        say: "SAY",
        ea: "EA",
        soz: "VERBAL",
        tyd: "TYT",
      },
      table: {
        subject: "Subject",
        correct: "Correct",
        wrong: "Wrong",
        net: "Net",
        totalNet: "Total net",
      },
      results: {
        title: "Estimated result",
        totalNet: "Total net",
        estimatedScore: "Estimated score",
        estimatedRank: "Estimated rank",
      },
      target: {
        title: "Target analysis",
        targetRankLabel: "Your target rank",
        targetRankPlaceholder: "e.g. 5000",
        requiredScore: "Required score",
        difference: "Difference",
        onTrack: "You're on track to hit your target!",
      },
      disclaimer: "Scores and ranks are <strong>rough estimates</strong> based on past trends; ÖSYM&#39;s exact formula cannot be replicated. For final decisions, use current YÖK Atlas and ÖSYM data. OBP/diploma not included.",
    },"""

tools_de = """    tools: {
      pageTitle: "YKS-Tools · PeakNET",
      title: "YKS-Tools",
      subtitle: "Net berechnen, geschätzten Score & Rang sehen, nötiges Net für Ziel erfahren.",
      quickNet: {
        title: "Schnelles Net (Einzeltest / Brand)",
        description: "Net für nicht-standard YKS-Tests (GİS, Brand, Mini) sofort berechnen. <strong>Net = R − F/4</strong>. Aufgabenanzahl optional.",
        totalLabel: "Aufg.-Anzahl (opt.)",
        correctLabel: "Richtig",
        wrongLabel: "Falsch",
        netLabel: "Net",
        emptyLabel: "Leer",
        accuracyLabel: "Trefferquote",
        invalid: "ungültig",
      },
      scoreTypes: {
        say: "SAY",
        ea: "EA",
        soz: "SÖZ",
        tyd: "TYT",
      },
      table: {
        subject: "Fach",
        correct: "Richtig",
        wrong: "Falsch",
        net: "Net",
        totalNet: "Gesamt-Net",
      },
      results: {
        title: "Geschätztes Ergebnis",
        totalNet: "Gesamt-Net",
        estimatedScore: "Geschätzter Score",
        estimatedRank: "Geschätzter Rang",
      },
      target: {
        title: "Zielanalyse",
        targetRankLabel: "Dein Zielrang",
        targetRankPlaceholder: "z. B. 5000",
        requiredScore: "Benötigter Score",
        difference: "Differenz",
        onTrack: "Du bist auf Kurs für dein Ziel!",
      },
      disclaimer: "Scores und Ränge sind <strong>grobe Schätzungen</strong> basierend auf Vorjahren; die exakte ÖSYM-Formel ist nicht nachbildbar. Für finale Entscheidungen aktuelle YÖK Atlas & ÖSYM Daten nutzen. OBP/Diploma nicht enthalten.",
    },"""

tools_ar = """    tools: {
      pageTitle: "أدوات YKS · PeakNET",
      title: "أدوات YKS",
      subtitle: "احسب النقاط، واعرض التقديرات للنتيجة والترتيب، وتعرف على النقاط المطلوبة لهدفك.",
      quickNet: {
        title: "حساب سريع للنقاط (اختبار منفرد / تجريب)",
        description: "احسب نقاط الاختبارات غير القياسية لـ YKS (GİS، علامة تجارية، مصغر) فورًا. <strong>النقاط = ص − خ/4</strong>. عدد الأسئلة اختياري.",
        totalLabel: "عدد الأسئلة (اختياري)",
        correctLabel: "صحيح",
        wrongLabel: "خطأ",
        netLabel: "النقاط",
        emptyLabel: "متروك",
        accuracyLabel: "دقة",
        invalid: "غير صالح",
      },
      scoreTypes: {
        say: "SAY",
        ea: "EA",
        soz: "سوزيل",
        tyd: "TYT",
      },
      table: {
        subject: "المادة",
        correct: "صحيح",
        wrong: "خطأ",
        net: "النقاط",
        totalNet: "إجمالي النقاط",
      },
      results: {
        title: "النتيجة التقديرية",
        totalNet: "إجمالي النقاط",
        estimatedScore: "النتيجة التقديرية",
        estimatedRank: "الترتيب التقديري",
      },
      target: {
        title: "تحليل الهدف",
        targetRankLabel: "ترتيبك المستهدف",
        targetRankPlaceholder: "مثال 5000",
        requiredScore: "الدرجة المطلوبة",
        difference: "الفرق",
        onTrack: "أنت على الطريق الصحيح لتحقيق هدفك!",
      },
      disclaimer: "الدرجات والترتيبات <strong>تقديرات تقريبية</strong> بناءً على الاتجاهات السابقة؛ لا يمكن استنساخ صيغة ÖSYM الدقيقة. للقرارات النهائية، استخدم YÖK Atlas وÖSYM الحاليين. OBP/الدبلوم غير مشمول.",
    },"""

# Convert to line arrays
tools_map = {
    'tr': [l + '\n' for l in tools_tr.split('\n')],
    'en': [l + '\n' for l in tools_en.split('\n')],
    'de': [l + '\n' for l in tools_de.split('\n')],
    'ar': [l + '\n' for l in tools_ar.split('\n')],
}

# Process each locale: find drawingBoard closing brace and insert tools after
locales = ['ar', 'de', 'en', 'tr']  # Process backwards to maintain line numbers

for locale in locales:
    tools_lines = tools_map[locale]
    
    # Find drawingBoard for this locale
    db_idx = None
    for i, line in enumerate(lines):
        if f'drawingBoard: {{' in line:
            # Check if we're in the right locale by looking backwards for locale marker
            # Simpler: use known line numbers
            pass
    
    # Use known line numbers for drawingBoard start
    known_lines = {'tr': 385, 'en': 780, 'de': 1127, 'ar': 1474}
    db_start_1idx = known_lines[locale]
    db_start = db_start_1idx - 1  # 0-indexed
    
    # Find the closing brace of drawingBoard (brace counting)
    brace_count = 0
    found_start = False
    insert_idx = None
    
    for i in range(db_start, len(lines)):
        if 'drawingBoard:' in lines[i]:
            found_start = True
        
        if found_start:
            # Count braces
            open_braces = lines[i].count('{')
            close_braces = lines[i].count('}')
            brace_count += open_braces - close_braces
            
            if brace_count == 0 and found_start:
                insert_idx = i + 1  # after the closing "    },"
                break
    
    if insert_idx is None:
        print(f"Could not find insert point for {locale}")
        continue
    
    # Check if tools already exists in next 50 lines
    has_tools = False
    for i in range(insert_idx, min(insert_idx + 50, len(lines))):
        if 'tools:' in lines[i] and lines[i].strip().startswith('tools:'):
            has_tools = True
            # Find end of existing tools
            tool_brace = 0
            end_idx = None
            for j in range(i, len(lines)):
                if 'tools:' in lines[j] and j == i:
                    tool_brace = 1
                else:
                    tool_brace += lines[j].count('{') - lines[j].count('}')
                    if tool_brace == 0:
                        end_idx = j + 1
                        break
            if end_idx:
                lines = lines[:i] + tools_map[locale] + lines[end_idx:]
                print(f"Replaced {locale} tools at lines {i+1}-{end_idx}")
            break
    
    if not has_tools:
        lines = lines[:insert_idx] + tools_map[locale] + lines[insert_idx:]
        print(f"Inserted {locale} tools at line {insert_idx+1}")

# Write back
with open('src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("All locales processed!")