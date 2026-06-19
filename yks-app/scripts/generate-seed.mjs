import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const data = JSON.parse(
  readFileSync(resolve(root, "data/mf-ayt-curriculum.json"), "utf8"),
);

const esc = (s) => String(s).replace(/'/g, "''");

const lines = [
  "-- Auto-generated from data/mf-ayt-curriculum.json",
  "-- MF AYT müfredat seed'i. Supabase SQL Editor'da çalıştır.",
  "",
  "begin;",
  "",
  "-- Subjects",
];

data.subjects.forEach((s, i) => {
  lines.push(
    `insert into public.subjects (id, name, color, question_count, display_order) values ('${esc(
      s.id,
    )}', '${esc(s.name)}', '${esc(s.color)}', ${s.question_count}, ${i})
  on conflict (id) do update set name = excluded.name, color = excluded.color, question_count = excluded.question_count, display_order = excluded.display_order;`,
  );
});

lines.push("", "-- Topics");

for (const s of data.subjects) {
  s.topics.forEach((t, i) => {
    lines.push(
      `insert into public.topics (id, subject_id, name, grade, priority, display_order) values ('${esc(
        t.id,
      )}', '${esc(s.id)}', '${esc(t.name)}', ${t.grade ?? "null"}, '${esc(
        t.priority,
      )}', ${i})
  on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, grade = excluded.grade, priority = excluded.priority, display_order = excluded.display_order;`,
    );
  });
}

lines.push("", "commit;", "");

const out = resolve(root, "supabase/migrations/0002_seed_curriculum.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"));
console.log("✔ Wrote", out);
console.log(
  `  ${data.subjects.length} subjects, ${data.subjects.reduce(
    (a, s) => a + s.topics.length,
    0,
  )} topics`,
);
