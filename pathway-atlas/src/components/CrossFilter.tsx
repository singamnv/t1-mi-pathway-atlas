"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

type Mol = {
  id: string; n: string; t: string; s: string; cls: string | null; tier: string | null;
  R: number | null; C: number | null; T1DI: number | null; ev: string[];
};
const CLASS_COLOR: Record<string, string> = {
  "Type-I-specific": "#43d17a", "Type-I-leaning (direct)": "#8fe3a8", "Type-II-associated": "#f2854e",
  "Shared / rises in both": "#e0c04a", "Indeterminate": "#8b98a9", "Low-confidence (proxy)": "#5a6675", "Insufficient evidence": "#3a4550",
};
const STEP_COLOR: Record<string, string> = {
  s1_lipid: "#f4a261", s2_inflammation: "#e76f51", s3_rupture: "#e63946", s4_endothelial: "#2a9d8f",
  s5_platelet: "#4361ee", s6_thromboxane: "#7209b7", s7_coagulation: "#3a0ca3", s8_injury: "#d62828", s0_systemic: "#6c757d",
};
const TYPE_COLOR: Record<string, string> = {
  protein: "#4cc9f0", gene: "#9d8df1", metabolite: "#43d17a", lipid: "#f2c14e", rna: "#f2854e",
  peptide: "#72b7b2", lipoprotein: "#e07a5f", complex: "#c77dff", other: "#8b98a9",
};
const EV = ["Lit", "Trials", "Omics", "Genetic", "Drug"];

export default function CrossFilter({ mols, stepShort }: { mols: Mol[]; stepShort: Record<string, string> }) {
  const router = useRouter();
  const [step, setStep] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [cls, setCls] = useState<string | null>(null);
  const [ev, setEv] = useState<string | null>(null);

  const filtered = useMemo(() => mols.filter((m) =>
    (!step || m.s === step) && (!type || m.t === type) && (!cls || m.cls === cls) && (!ev || m.ev.includes(ev))
  ), [mols, step, type, cls, ev]);

  const agg = (key: (m: Mol) => string | null | undefined, colorMap?: Record<string, string>, labelMap?: Record<string, string>) => {
    const c: Record<string, number> = {};
    for (const m of filtered) { const k = key(m); if (k) c[k] = (c[k] || 0) + 1; }
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ k, label: labelMap?.[k] ?? k, n, color: colorMap?.[k] ?? "#4cc9f0" }));
  };
  const byStep = useMemo(() => agg((m) => m.s, STEP_COLOR, stepShort), [filtered]);
  const byType = useMemo(() => agg((m) => m.t, TYPE_COLOR), [filtered]);
  const byClass = useMemo(() => agg((m) => m.cls, CLASS_COLOR), [filtered]);
  const byEv = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of filtered) for (const e of m.ev) c[e] = (c[e] || 0) + 1;
    return EV.map((e) => ({ k: e, label: e, n: c[e] || 0, color: "#4cc9f0" }));
  }, [filtered]);

  const chips: { label: string; val: string; clear: () => void }[] = [];
  if (step) chips.push({ label: `Step: ${stepShort[step] ?? step}`, val: step, clear: () => setStep(null) });
  if (type) chips.push({ label: `Type: ${type}`, val: type, clear: () => setType(null) });
  if (cls) chips.push({ label: `Class: ${cls}`, val: cls, clear: () => setCls(null) });
  if (ev) chips.push({ label: `Evidence: ${ev}`, val: ev, clear: () => setEv(null) });

  const tt = { contentStyle: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }, itemStyle: { color: "var(--text)" }, cursor: { fill: "var(--track)" } };
  const panel: React.CSSProperties = { background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" };
  const ptitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 };

  const MiniBar = ({ data, onPick, active }: { data: { k: string; label: string; n: number; color: string }[]; onPick: (k: string) => void; active: string | null }) => (
    <ResponsiveContainer width="100%" height={Math.max(150, data.length * 26)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 30 }}>
        <CartesianGrid stroke="var(--grid)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 9.5, fill: "#8b98a9" }} />
        <YAxis type="category" dataKey="label" width={116} tick={{ fontSize: 10, fill: "#8b98a9" }} interval={0} />
        <Tooltip {...tt} />
        <Bar dataKey="n" radius={[0, 3, 3, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 10 }}
          onClick={(d) => d && onPick((d as unknown as { k: string }).k)} style={{ cursor: "pointer" }}>
          {data.map((d) => <Cell key={d.k} fill={d.color} fillOpacity={active && active !== d.k ? 0.3 : 0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{filtered.length.toLocaleString()}</span>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>of {mols.length.toLocaleString()} molecules match</span>
        {chips.map((c) => (
          <button key={c.label} onClick={c.clear} style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 20, background: "rgba(255,90,95,0.15)", color: "var(--accent)", border: "1px solid rgba(255,90,95,0.45)", cursor: "pointer" }}>
            {c.label} ✕
          </button>
        ))}
        {chips.length > 0 && (
          <button onClick={() => { setStep(null); setType(null); setCls(null); setEv(null); }}
            style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 20, background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", cursor: "pointer" }}>
            Reset all
          </button>
        )}
      </div>
      <div className="grid-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={panel}><div style={ptitle}>By pathway step</div><MiniBar data={byStep} onPick={(k) => setStep(step === k ? null : k)} active={step} /></div>
        <div style={panel}><div style={ptitle}>By discrimination class</div><MiniBar data={byClass} onPick={(k) => setCls(cls === k ? null : k)} active={cls} /></div>
        <div style={panel}><div style={ptitle}>By molecule type</div><MiniBar data={byType} onPick={(k) => setType(type === k ? null : k)} active={type} /></div>
        <div style={panel}><div style={ptitle}>By evidence source</div><MiniBar data={byEv} onPick={(k) => setEv(ev === k ? null : k)} active={ev} /></div>
      </div>
      {/* matching molecules preview */}
      <div style={{ ...panel, marginTop: 14 }}>
        <div style={ptitle}>Matching molecules ({filtered.length.toLocaleString()}) — click to open · top 60 by T1DI</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[...filtered].sort((a, b) => (b.T1DI ?? -1) - (a.T1DI ?? -1)).slice(0, 60).map((m) => (
            <button key={m.id} onClick={() => router.push(`/molecule/${m.id}`)} title={`${m.cls ?? ""}${m.T1DI != null ? " · T1DI " + m.T1DI.toFixed(0) : ""}`}
              style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 6, background: "var(--panel)", border: `1px solid ${m.cls && CLASS_COLOR[m.cls] ? CLASS_COLOR[m.cls] + "55" : "var(--border)"}`, color: "var(--text)", cursor: "pointer" }}>
              {m.n}
            </button>
          ))}
          {filtered.length === 0 && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>No molecules match the current filters.</span>}
        </div>
      </div>
    </div>
  );
}
