const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pagesToTranslate = [
  "basarimlar", "coz", "deneme-sim", "denemeler", "diller", "hedef", 
  "istatistikler", "kartlar", "konular", "muzik", "notlar", "panel", 
  "paylas", "pomodoro", "program", "satranc", "soru-takibi", "soru-uret", 
  "tarama", "ustalik", "yanlislar", "yurtdisi"
];

function injectToI18n(dictKeys, ns) {
  const i18nPath = path.resolve(process.cwd(), "src/lib/i18n.ts");
  let i18nCode = fs.readFileSync(i18nPath, "utf8");
  if (i18nCode.includes(`\n    ${ns}: {`)) {
    console.log(`ℹ️   Namespace ${ns} already exists in i18n.ts.`);
    return;
  }
  const locales = ["tr", "en", "de", "ar"];
  for (let i = 0; i < locales.length; i++) {
    const locale = locales[i];
    const nextLocale = locales[i + 1];
    let marker = nextLocale ? `\n  },\n  ${nextLocale}: {` : `\n  }\n} as const;`;
    const idx = i18nCode.indexOf(marker);
    if (idx !== -1) {
      let block = `\n    ${ns}: {\n`;
      for (const [k, v] of Object.entries(dictKeys[locale] || {})) {
        const safe = String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, '\\n');
        block += `      ${k}: "${safe}",\n`;
      }
      block += `    },`;
      i18nCode = i18nCode.slice(0, idx) + block + i18nCode.slice(idx);
    }
  }
  fs.writeFileSync(i18nPath, i18nCode, "utf8");
  console.log(`✅  Injected ${ns} into src/lib/i18n.ts`);
}

function injectToPage(ns, pagePath) {
  if (!fs.existsSync(pagePath)) return;
  let pageCode = fs.readFileSync(pagePath, "utf8");
  
  // Find component name from export default function ComponentName()
  const compMatch = pageCode.match(/export default (?:async )?function ([A-Za-z0-9_]+)\(\)/);
  if (!compMatch) return;
  
  // Replace <ClientComponent /> with <ClientComponent dict={dict.ns} />
  const returnMatch = pageCode.match(/return\s+<([A-Za-z0-9_]+)\s*\/>/);
  if (returnMatch) {
    pageCode = pageCode.replace(returnMatch[0], `return <${returnMatch[1]} dict={dict.${ns}} />`);
    fs.writeFileSync(pagePath, pageCode, "utf8");
    console.log(`✅  Injected dict prop into ${pagePath}`);
  } else {
    console.log(`ℹ️   Could not auto-inject dict prop in ${pagePath}`);
  }
}

async function run() {
  console.log("Starting batch translation...");
  for (const page of pagesToTranslate) {
    const clientPath = `src/app/(app)/${page}/client.tsx`;
    if (!fs.existsSync(clientPath)) {
      console.log(`⚠️  Skipping ${page}: ${clientPath} not found`);
      continue;
    }
    
    console.log(`\n======================================================`);
    console.log(`🚀 Processing ${page}...`);
    try {
      // Run auto-translate without auto-apply to just get the output
      // we'll run it WITH --apply to overwrite client.tsx, but then we'll extract the dict snippet.
      // Wait, auto-translate.js v2 doesn't output pure JSON if we run with --apply, it outputs text.
      // Let's modify auto-translate.js temporarily or just capture its output.
      // Actually, auto-translate.js writes to a `.translated.tsx` if we don't use --apply.
      const out = execSync(`node scripts/auto-translate.js "${clientPath}"`, { encoding: 'utf8', stdio: 'pipe' });
      
      // Parse the dictionary from the snippet output
      const dictMatch = out.split("DICTIONARY SNIPPET")[1];
      if (!dictMatch) {
        console.log(`⚠️  Could not parse dict snippet for ${page}. Output:`, out);
        continue;
      }
      
      // Parse the object from the snippet text
      const locales = ["tr", "en", "de", "ar"];
      const dictKeys = { tr: {}, en: {}, de: {}, ar: {} };
      
      let currentLocale = null;
      for (const line of dictMatch.split("\n")) {
        const trMatch = line.match(/─── (tr|en|de|ar) ───/);
        if (trMatch) currentLocale = trMatch[1];
        
        const keyMatch = line.match(/^\s+([a-zA-Z0-9_]+):\s+"(.*)",$/);
        if (currentLocale && keyMatch) {
          dictKeys[currentLocale][keyMatch[1]] = keyMatch[2];
        }
      }
      
      // We have the dict. Now apply the rewrite
      execSync(`node scripts/auto-translate.js "${clientPath}" --apply`, { stdio: 'inherit' });
      
      // Inject to i18n
      injectToI18n(dictKeys, page);
      
      // Inject to page.tsx
      injectToPage(page, `src/app/(app)/${page}/page.tsx`);
      
    } catch (e) {
      console.error(`❌ Failed on ${page}:`, e.message);
    }
  }
}

run();
