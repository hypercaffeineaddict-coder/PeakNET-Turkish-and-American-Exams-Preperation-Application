"use client";

import { useMemo, useState } from "react";
import { Calculator, Target, TrendingUp, Info, Trophy } from "lucide-react";
import {
  type PuanTuru,
  PUAN_TURU_LABEL,
  TYT_FIELDS,
  AYT_FIELDS,
  type NetField,
  netHesapla,
  maxNet,
  tahminiPuan,
  tahminiSiralama,
  hedefIcinPuan,
  formatRank,
} from "@/data/yks-scoring";
import type { getDict } from "@/lib/i18n";

type Dict = ReturnType<typeof getDict>;

type DY = { d: string; y: string };
type ValMap = Record<string, DY>;

const PUAN_TURLERI: PuanTuru[] = ["SAY", "EA", "SOZ", "TYT"];

function emptyMap(fields: NetField[]): ValMap {
  const m: ValMap = {};
  for (const f of fields) m[f.key] = { d: "", y: "" };
  return m;
}

export function AraclarClient({ dict }: { dict: Dict["araclar"] }) {
  const [tur, setTur] = useState<PuanTuru>("SAY");
  const [tytVals, setTytVals] = useState<ValMap>(() => emptyMap(TYT_FIELDS));
  const [aytVals, setAytVals] = useState<ValMap>(() =>
    emptyMap(AYT_FIELDS.SAY),
  );
  const [hedefRank, setHedefRank] = useState<string>("");

  const aytFields = tur === "TYT" ? [] : AYT_FIELDS[tur];

  // Tür değişince AYT alanlarını sıfırla
  function changeTur(next: PuanTuru) {
    setTur(next);
    if (next !== "TYT") setAytVals(emptyMap(AYT_FIELDS[next]));
  }

  function setVal(
    which: "tyt" | "ayt",
    key: string,
    field: "d" | "y",
    raw: string,
    count: number,
  ) {
    const num = raw.replace(/[^0-9]/g, "");
    const setter = which === "tyt" ? setTytVals : setAytVals;
    setter((prev) => {
      const cur = prev[key] ?? { d: "", y: "" };
      const next = { ...cur, [field]: num };
      // doğru + yanlış toplam soru sayısını aşmasın
      const d = Number(next.d) || 0;
      const y = Number(next.y) || 0;
      if (d + y > count) {
        if (field === "d") next.d = String(Math.max(0, count - y));
        else next.y = String(Math.max(0, count - d));
      }
      return { ...prev, [key]: next };
    });
  }

  const tytNet = useMemo(
    () =>
      TYT_FIELDS.reduce(
        (a, f) =>
          a + netHesapla(Number(tytVals[f.key]?.d) || 0, Number(tytVals[f.key]?.y) || 0),
        0,
      ),
    [tytVals],
  );

  const aytNet = useMemo(
    () =>
      aytFields.reduce(
        (a, f) =>
          a + netHesapla(Number(aytVals[f.key]?.d) || 0, Number(aytVals[f.key]?.y) || 0),
        0,
      ),
    [aytVals, aytFields],
  );

  const puan = useMemo(
    () => tahminiPuan(tur, tytNet, aytNet),
    [tur, tytNet, aytNet],
  );
  const siralama = useMemo(() => tahminiSiralama(tur, puan), [tur, puan]);

  const hedef = Number(hedefRank.replace(/[^0-9]/g, "")) || 0;
  const gerekenPuan = hedef > 0 ? hedefIcinPuan(tur, hedef) : null;
  const puanFarki = gerekenPuan != null ? Math.round((gerekenPuan - puan) * 10) / 10 : null;

  const maxTyt = maxNet(TYT_FIELDS);
  const maxAyt = tur === "TYT" ? 0 : maxNet(aytFields);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Calculator className="text-primary" size={26} />
          {dict.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.description}
        </p>
      </header>

      <QuickNet dict={dict} />

      {/* Puan türü seçici */}
      <div className="flex flex-wrap gap-2">
        {PUAN_TURLERI.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => changeTur(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tur === t
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {PUAN_TURU_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Net giriş tablosu */}
        <div className="space-y-6">
          <NetTable
            title="TYT"
            subtitle={dict.totalNet.replace("{net}", tytNet.toFixed(2)).replace("{max}", String(maxTyt))}
            fields={TYT_FIELDS}
            vals={tytVals}
            onChange={(key, field, raw, count) =>
              setVal("tyt", key, field, raw, count)
            }
            dict={dict}
          />

          {tur !== "TYT" && (
            <NetTable
              title={`AYT — ${PUAN_TURU_LABEL[tur]}`}
              subtitle={dict.totalNet.replace("{net}", aytNet.toFixed(2)).replace("{max}", String(maxAyt))}
              fields={aytFields}
              vals={aytVals}
              onChange={(key, field, raw, count) =>
                setVal("ayt", key, field, raw, count)
              }
              dict={dict}
            />
          )}
        </div>

        {/* Sonuç paneli */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp size={16} className="text-emerald-500" />
              {dict.estimatedResult}
            </h2>
            <dl className="mt-4 space-y-3">
              <ResultRow label={dict.totalNetLabel} value={(tytNet + aytNet).toFixed(2)} />
              <ResultRow
                label={dict.estimatedScore}
                value={puan.toFixed(1)}
                big
              />
              <ResultRow
                label={dict.estimatedRank}
                value={siralama != null ? `~${formatRank(siralama)}` : "—"}
                big
              />
            </dl>
          </section>

          {/* Hedef analizi */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Target size={16} className="text-rose-500" />
              {dict.targetAnalysis}
            </h2>
            <label className="mt-3 block text-xs text-muted-foreground">
              {dict.targetRank}
            </label>
            <input
              inputMode="numeric"
              value={hedefRank}
              onChange={(e) => setHedefRank(e.target.value)}
              placeholder={dict.placeholderRank}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {gerekenPuan != null && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{dict.requiredScore}</span>
                  <span className="font-semibold">~{gerekenPuan.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{dict.difference}</span>
                  <span
                    className={`font-semibold ${
                      (puanFarki ?? 0) <= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {puanFarki != null && puanFarki <= 0
                      ? dict.aboveTarget.replace("{diff}", Math.abs(puanFarki).toFixed(1))
                      : dict.pointsNeeded.replace("{diff}", puanFarki?.toFixed(1) ?? "0")}
                  </span>
                </div>
                {puanFarki != null && puanFarki <= 0 && (
                  <p className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <Trophy size={13} /> {dict.onTrackMessage}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <Info size={15} className="mt-0.5 shrink-0" />
        <span>{dict.disclaimer}</span>
      </p>
    </div>
  );
}

function QuickNet({ dict }: { dict: Dict["araclar"] }) {
  const [d, setD] = useState("");
  const [y, setY] = useState("");
  const [total, setTotal] = useState("");
  const dn = Number(d) || 0;
  const yn = Number(y) || 0;
  const tn = Number(total) || 0;
  const net = Math.max(0, dn - yn / 4);
  const bos = tn > 0 ? Math.max(0, tn - dn - yn) : null;
  const valid = tn === 0 || dn + yn <= tn;
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Calculator size={15} className="text-primary" />
        {dict.quickNetTitle}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {dict.quickNetDesc}
      </p>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="text-xs">
          <span className="text-muted-foreground">{dict.questionCountOptional}</span>
          <input
            type="text"
            inputMode="numeric"
            value={total}
            onChange={(e) => setTotal(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="—"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs">
          <span className="text-emerald-500">{dict.correct}</span>
          <input
            type="text"
            inputMode="numeric"
            value={d}
            onChange={(e) => setD(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs">
          <span className="text-rose-500">{dict.incorrect}</span>
          <input
            type="text"
            inputMode="numeric"
            value={y}
            onChange={(e) => setY(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
          />
        </label>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{dict.net}</div>
          <div
            className={`font-display text-2xl font-bold tabular-nums ${
              valid ? "text-primary" : "text-rose-500"
            }`}
          >
            {valid ? net.toFixed(2) : dict.invalid}
          </div>
        </div>
      </div>
      {bos !== null && valid && (
        <div className="mt-2 text-xs text-muted-foreground">
          {dict.empty}: <span className="tabular-nums">{bos}</span> · {dict.accuracy}:{" "}
          <span className="tabular-nums">
            {dn + yn > 0 ? `%${Math.round((dn / (dn + yn)) * 100)}` : "—"}
          </span>
        </div>
      )}
    </section>
  );
}

function NetTable({
  title,
  subtitle,
  fields,
  vals,
  onChange,
  dict,
}: {
  title: string;
  subtitle: string;
  fields: NetField[];
  vals: ValMap;
  onChange: (key: string, field: "d" | "y", raw: string, count: number) => void;
  dict: Dict["araclar"];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{dict.subject}</span>
          <span className="w-16 text-center">{dict.correct}</span>
          <span className="w-16 text-center">{dict.incorrect}</span>
          <span className="w-14 text-right">{dict.net}</span>
        </div>
        {fields.map((f) => {
          const v = vals[f.key] ?? { d: "", y: "" };
          const net = netHesapla(Number(v.d) || 0, Number(v.y) || 0);
          return (
            <div
              key={f.key}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2"
            >
              <span className="text-sm">
                {f.label}{" "}
                <span className="text-xs text-muted-foreground">
                  ({f.count})
                </span>
              </span>
              <input
                inputMode="numeric"
                value={v.d}
                onChange={(e) => onChange(f.key, "d", e.target.value, f.count)}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
                placeholder="0"
              />
              <input
                inputMode="numeric"
                value={v.y}
                onChange={(e) => onChange(f.key, "y", e.target.value, f.count)}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
                placeholder="0"
              />
              <span className="w-14 text-right text-sm font-semibold tabular-nums">
                {net.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultRow({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={`tabular-nums ${big ? "font-display text-2xl font-bold text-primary" : "text-base font-semibold"}`}
      >
        {value}
      </dd>
    </div>
  );
}
