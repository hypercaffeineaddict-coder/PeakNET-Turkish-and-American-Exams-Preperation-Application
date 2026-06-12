#!/usr/bin/env node
/**
 * PeakNET Auto-Translate Script v2
 * Usage: node scripts/auto-translate.js <path-to-component> [--apply]
 *
 * Strategy:
 *  1. Ask Gemini ONLY for the translation dict (small, reliable JSON)
 *  2. We do the component rewriting in Node.js ourselves (reliable)
 *
 * This avoids embedding 400+ lines of code inside a JSON string value,
 * which always breaks JSON encoding in LLM responses.
 */

const fs = require("fs");
const path = require("path");

// ─── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)\s*=\s*(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
const API_BASE = (
  process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta"
).trim();

if (!GEMINI_KEY) {
  console.error("❌  GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const autoApply = flags.includes("--apply");

const targetFile = args[0];
if (!targetFile) {
  console.error("❌  Usage: node scripts/auto-translate.js <path> [--apply]");
  process.exit(1);
}

const absPath = path.resolve(process.cwd(), targetFile);
if (!fs.existsSync(absPath)) {
  console.error(`❌  File not found: ${absPath}`);
  process.exit(1);
}

const componentCode = fs.readFileSync(absPath, "utf8");
const fileName = path.basename(absPath, path.extname(absPath));
const relPath = path.relative(path.join(process.cwd(), "src/app/(app)"), absPath);
const namespace = relPath.split(path.sep)[0] || fileName;

// ─── Gemini call ────────────────────────────────────────────────────────────
const EXTRACT_PROMPT = `You are an i18n expert for a Next.js app (PeakNET - Turkish YKS exam prep platform).

Extract ALL hardcoded user-visible strings from this React component and return ONLY a JSON dict with translations for tr/en/de/ar.

Rules:
- SKIP: Tailwind classes, import paths, prop names (className, type, key, href, placeholder values that are symbols like "0", "—")
- SKIP: Official exam acronyms used as labels: "TYT", "AYT", "SAY", "EA", "SOZ", "YKS"
- INCLUDE: All Turkish user-facing text (titles, labels, descriptions, button text, error messages, status text)
- For interpolated strings like "Toplam net: X / Y", use placeholders: "Toplam net: {net} / {max}"
- Use short camelCase keys that describe the content (e.g. "title", "quickNetTitle", "correctLabel")
- tr = original Turkish, en = English, de = German, ar = Arabic

Return ONLY this JSON structure (no markdown, no explanation):
{
  "tr": { "keyName": "Turkish text" },
  "en": { "keyName": "English text" },
  "de": { "keyName": "German text" },
  "ar": { "keyName": "Arabic text" }
}`;

async function callGemini(prompt, code) {
  const url = `${API_BASE}/models/${GEMINI_MODEL}:generateContent`;
  const body = {
    contents: [{ role: "user", parts: [{ text: `${prompt}\n\nComponent:\n\`\`\`tsx\n${code}\n\`\`\`` }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = await res.json();
  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    console.warn(`⚠️  Gemini finished with reason: ${finishReason}`);
  }

  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

// ─── Component rewriter ─────────────────────────────────────────────────────
/**
 * Given the original component code and a flat dict of { key: trValue },
 * replaces every literal Turkish string with dict.namespace.key references.
 * Works by sorting strings longest-first to avoid partial replacements.
 */
function rewriteComponent(code, trDict, ns) {
  // Build sorted list of [original_string, key] pairs, longest string first
  // so "Net hesapla, tahmini..." is replaced before just "Net"
  const pairs = Object.entries(trDict).sort(([, a], [, b]) => b.length - a.length);

  let result = code;

  for (const [key, original] of pairs) {
    // Skip very short strings (< 3 chars) or exam acronyms to avoid false positives
    if (original.length < 3) continue;

    // Escape special regex characters in the original string
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match the string in double-quotes, single-quotes, JSX text, or template literals
    // We try the most common patterns:

    // 1. Exact JSX text node content (between > and <)
    result = result.replace(
      new RegExp(`(>\\s*)${escaped}(\\s*<)`, "g"),
      `$1{dict.${ns}.${key}}$2`
    );

    // 2. Double-quoted string value
    result = result.replace(
      new RegExp(`"${escaped}"`, "g"),
      `{dict.${ns}.${key}}`
    );

    // 3. Single-quoted string
    result = result.replace(
      new RegExp(`'${escaped}'`, "g"),
      `{dict.${ns}.${key}}`
    );
  }

  // Add dict prop to the exported function signature if not already present
  // Look for the main exported function and inject { dict } prop
  const exportedFuncMatch = result.match(
    /export function ([A-Za-z0-9_]+)\(\s*\)/
  );
  if (exportedFuncMatch) {
    result = result.replace(
      `export function ${exportedFuncMatch[1]}()`,
      `export function ${exportedFuncMatch[1]}({ dict }: { dict: Dict["${ns}"] })`
    );
  }

  // Add type import if needed
  if (!result.includes("getDict") && !result.includes("type Dict")) {
    const firstImport = result.indexOf("import ");
    if (firstImport !== -1) {
      result =
        result.slice(0, firstImport) +
        `import type { getDict } from "@/lib/i18n";\ntype Dict = ReturnType<typeof getDict>;\n\n` +
        result.slice(firstImport);
    }
  }

  return result;
}

// ─── i18n snippet formatter ──────────────────────────────────────────────────
function formatI18nSnippet(ns, dictKeys) {
  const locales = ["tr", "en", "de", "ar"];
  let out = `\n// ===== Paste into each locale block in src/lib/i18n.ts =====\n`;
  for (const locale of locales) {
    out += `\n// ─── ${locale} ───\n${ns}: {\n`;
    for (const [k, v] of Object.entries(dictKeys[locale] || {})) {
      const safe = String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      out += `  ${k}: "${safe}",\n`;
    }
    out += `},\n`;
  }
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n🌍  PeakNET Auto-Translate v2`);
  console.log(`📄  File      : ${targetFile}`);
  console.log(`🔑  Namespace : ${namespace}`);
  console.log(`🤖  Model     : ${GEMINI_MODEL}`);
  console.log(`⏳  Asking Gemini to extract translations...\n`);

  let rawResponse;
  try {
    rawResponse = await callGemini(EXTRACT_PROMPT, componentCode);
  } catch (err) {
    console.error("❌  Gemini call failed:", err.message);
    process.exit(1);
  }

  let dictKeys;
  try {
    dictKeys = JSON.parse(rawResponse);
  } catch {
    const debugPath = absPath.replace(/\.tsx?$/, ".gemini-raw.json");
    fs.writeFileSync(debugPath, rawResponse, "utf8");
    console.error("❌  Failed to parse Gemini response as JSON.");
    console.error(`   Raw saved: ${path.relative(process.cwd(), debugPath)}`);
    console.error(`   Preview: ${rawResponse.slice(0, 300)}`);
    process.exit(1);
  }

  const trDict = dictKeys["tr"] || {};
  const keyCount = Object.keys(trDict).length;
  console.log(`✅  Found ${keyCount} translatable strings!\n`);

  if (keyCount === 0) {
    console.log("ℹ️   No hardcoded strings found. File may already be translated.");
    process.exit(0);
  }

  // Rewrite component using string substitution
  const rewritten = rewriteComponent(componentCode, trDict, namespace);

  // Print the i18n snippet
  const snippet = formatI18nSnippet(namespace, dictKeys);
  console.log("═".repeat(70));
  console.log("📋  DICTIONARY SNIPPET — add to each locale in src/lib/i18n.ts:");
  console.log("═".repeat(70));
  console.log(snippet);
  console.log("═".repeat(70));

  // Save preview
  const reviewPath = absPath.replace(/\.tsx?$/, ".translated.tsx");
  fs.writeFileSync(reviewPath, rewritten, "utf8");
  console.log(`\n📝  Preview saved : ${path.relative(process.cwd(), reviewPath)}`);

  if (autoApply) {
    fs.writeFileSync(absPath, rewritten, "utf8");
    fs.unlinkSync(reviewPath);
    console.log(`✅  Original overwritten: ${targetFile}`);
  } else {
    console.log(`ℹ️   To apply  : node scripts/auto-translate.js "${targetFile}" --apply`);
  }

  console.log("\n📌  Next steps:");
  console.log("   1. Paste the dictionary snippet into src/lib/i18n.ts (all 4 locales)");
  console.log(`   2. In the page server component, pass: <${fileName[0].toUpperCase() + fileName.slice(1)} dict={dict.${namespace}} />`);
  console.log("   3. Run: npx tsc --noEmit\n");
})();
