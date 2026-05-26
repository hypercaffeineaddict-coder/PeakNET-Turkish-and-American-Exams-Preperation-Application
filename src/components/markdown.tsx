import React from "react";

// AI çıktısı için sade markdown render (başlık, liste, kalın, italik, kod, alıntı).
// react-markdown gibi büyük lib eklemeden, kontrollü ve PDF-print uyumlu.

function inline(text: string, keyBase: string): React.ReactNode[] {
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const t = m[0];
    if (t.startsWith("**"))
      parts.push(
        <strong key={`${keyBase}-${i++}`} className="font-semibold text-foreground">
          {t.slice(2, -2)}
        </strong>,
      );
    else if (t.startsWith("`"))
      parts.push(
        <code key={`${keyBase}-${i++}`} className="rounded bg-muted px-1 font-mono text-[0.9em]">
          {t.slice(1, -1)}
        </code>,
      );
    else
      parts.push(
        <em key={`${keyBase}-${i++}`} className="italic">
          {t.slice(1, -1)}
        </em>,
      );
    last = idx + t.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuf.length === 0) return;
    const items = listBuf;
    out.push(
      <ul key={`l${key++}`} className="my-2 ml-5 list-disc space-y-1">
        {items.map((l, j) => (
          <li key={j} className="leading-relaxed">
            {inline(l, `li${key}-${j}`)}
          </li>
        ))}
      </ul>,
    );
    listBuf = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (/^\s*[-*]\s+/.test(line)) {
      listBuf.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }
    flushList();
    if (!line.trim()) {
      out.push(<div key={`b${key++}`} className="h-2" />);
      continue;
    }
    if (line.startsWith("### "))
      out.push(
        <h4 key={`h${key++}`} className="mt-4 text-sm font-semibold text-foreground">
          {inline(line.slice(4), `h${key}`)}
        </h4>,
      );
    else if (line.startsWith("## "))
      out.push(
        <h3 key={`h${key++}`} className="mt-5 font-display text-lg font-bold text-foreground">
          {inline(line.slice(3), `h${key}`)}
        </h3>,
      );
    else if (line.startsWith("# "))
      out.push(
        <h2 key={`h${key++}`} className="mt-5 font-display text-xl font-bold text-foreground">
          {inline(line.slice(2), `h${key}`)}
        </h2>,
      );
    else if (line.startsWith("> "))
      out.push(
        <blockquote
          key={`q${key++}`}
          className="my-2 border-l-2 border-primary/60 pl-3 italic text-muted-foreground"
        >
          {inline(line.slice(2), `q${key}`)}
        </blockquote>,
      );
    else
      out.push(
        <p key={`p${key++}`} className="leading-relaxed">
          {inline(line, `p${key}`)}
        </p>,
      );
  }
  flushList();
  return <div className="text-sm">{out}</div>;
}
