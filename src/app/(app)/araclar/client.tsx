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

type DY = { d: string; y: string };
type ValMap = Record<string, DY>;

const PUAN_TURLERI: PuanTuru[] = ["SAY", "EA", "SOZ", "TYT"];

function emptyMap(fields: NetField[]): ValMap {
  const m: ValMap = {};
  for (const f of fields) m[f.key] = { d: "", y: "" };
  return m;
}

export function AraclarClient() {
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
          YKS Araçları
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Net hesapla, tahmini puanını ve sıralamanı gör, hedefin için gereken
          neti öğren.
        </p>
      </header>

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
            subtitle={`Toplam net: ${tytNet.toFixed(2)} / ${maxTyt}`}
            fields={TYT_FIELDS}
            vals={tytVals}
            onChange={(key, field, raw, count) =>
              setVal("tyt", key, field, raw, count)
            }
          />

          {tur !== "TYT" && (
            <NetTable
              title={`AYT — ${PUAN_TURU_LABEL[tur]}`}
              subtitle={`Toplam net: ${aytNet.toFixed(2)} / ${maxAyt}`}
              fields={aytFields}
              vals={aytVals}
              onChange={(key, field, raw, count) =>
                setVal("ayt", key, field, raw, count)
              }
            />
          )}
        </div>

        {/* Sonuç paneli */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp size={16} className="text-emerald-500" />
              Tahmini sonuç
            </h2>
            <dl className="mt-4 space-y-3">
              <ResultRow label="Toplam net" value={(tytNet + aytNet).toFixed(2)} />
              <ResultRow
                label="Tahmini puan"
                value={puan.toFixed(1)}
                big
              />
              <ResultRow
                label="Tahmini sıralama"
                value={siralama != null ? `~${formatRank(siralama)}` : "—"}
                big
              />
            </dl>
          </section>

          {/* Hedef analizi */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Target size={16} className="text-rose-500" />
              Hedef analizi
            </h2>
            <label className="mt-3 block text-xs text-muted-foreground">
              Hedef sıralaman
            </label>
            <input
              inputMode="numeric"
              value={hedefRank}
              onChange={(e) => setHedefRank(e.target.value)}
              placeholder="örn. 5000"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {gerekenPuan != null && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gereken puan</span>
                  <span className="font-semibold">~{gerekenPuan.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fark</span>
                  <span
                    className={`font-semibold ${
                      (puanFarki ?? 0) <= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {puanFarki != null && puanFarki <= 0
                      ? `Hedefin üstündesin (+${Math.abs(puanFarki).toFixed(1)})`
                      : `+${puanFarki?.toFixed(1)} puan gerek`}
                  </span>
                </div>
                {puanFarki != null && puanFarki <= 0 && (
                  <p className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <Trophy size={13} /> Bu tempoyla hedefe ulaşıyorsun!
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <Info size={15} className="mt-0.5 shrink-0" />
        <span>
          Puan ve sıralama değerleri geçmiş yıl eğilimlerine dayalı{" "}
          <strong>kaba tahminlerdir</strong>; ÖSYM&apos;nin gerçek standart
          puan hesabı dışarıdan birebir yapılamaz. Kesin tercih kararı için
          güncel YÖK Atlas ve ÖSYM verilerini kullan. OBP/diploma katkısı bu
          hesaba dahil değildir.
        </span>
      </p>
    </div>
  );
}

function NetTable({
  title,
  subtitle,
  fields,
  vals,
  onChange,
}: {
  title: string;
  subtitle: string;
  fields: NetField[];
  vals: ValMap;
  onChange: (key: string, field: "d" | "y", raw: string, count: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Ders</span>
          <span className="w-16 text-center">Doğru</span>
          <span className="w-16 text-center">Yanlış</span>
          <span className="w-14 text-right">Net</span>
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
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
                placeholder="0"
              />
              <input
                inputMode="numeric"
                value={v.y}
                onChange={(e) => onChange(f.key, "y", e.target.value, f.count)}
                className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
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
        className={`font-semibold tabular-nums ${big ? "text-2xl text-primary" : "text-base"}`}
      >
        {value}
      </dd>
    </div>
  );
}
