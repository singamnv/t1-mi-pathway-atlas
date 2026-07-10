"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ReferenceLine, ReferenceArea, Legend, Customized,
} from "recharts";

const CLASS_COLOR: Record<string, string> = {
  "Type-I-specific": "#43d17a", "Type-I-leaning (direct)": "#8fe3a8", "Type-II-associated": "#f2854e",
  "Shared / rises in both": "#e0c04a", "Indeterminate": "#8b98a9", "Low-confidence (proxy)": "#5a6675", "Insufficient evidence": "#3a4550",
};
const CLASS_ORDER = ["Type-I-specific", "Type-I-leaning (direct)", "Shared / rises in both", "Indeterminate", "Type-II-associated", "Low-confidence (proxy)", "Insufficient evidence"];
const EVID_COLOR: Record<string, string> = { Literature: "#4cc9f0", Trials: "#43d17a", Omics: "#9d8df1", Genetic: "#e0c04a", Druggable: "#f2854e" };

const card: React.CSSProperties = { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 18 };
const h3: React.CSSProperties = { fontSize: 14.5, fontWeight: 700, marginBottom: 3 };
const sub: React.CSSProperties = { fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 };

function Box({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return <div style={card}><div style={h3}>{title}</div>{note && <div style={sub}>{note}</div>}{children}</div>;
}

type A = {
  scatter_RC: { id: string; n: string; R: number; C: number; cls: string; T1DI: number | null; tier: string; npmids: number; step: string }[];
  step_class: Record<string, string | number>[];
  coverage_axes: { axis: string; n: number; color: string }[];
  assay_tubes: { tube: string; n: number }[];
  assay_methods: { method: string; n: number }[];
  assay_flag: { flag: string; n: number }[];
  evidence_by_step: Record<string, string | number>[];
  t1di_top: { id: string; n: string; T1DI: number; cls: string; R: number | null; C: number | null; D: string | null }[];
  upset: { combo: string[]; label: string; n: number }[];
  setsize: Record<string, number>;
  mech_kw: { kw: string; n: number }[];
};

export default function DashboardAnalytics({ a }: { a: A }) {
  const router = useRouter();
  const [scTier, setScTier] = useState("all");
  const scatterData = useMemo(() => {
    const rows = scTier === "tier1" ? a.scatter_RC.filter((d) => d.tier === "tier1_deep") : a.scatter_RC;
    // group by class for colored series
    const byClass: Record<string, typeof rows> = {};
    for (const r of rows) (byClass[r.cls] ??= []).push(r);
    return byClass;
  }, [a.scatter_RC, scTier]);

  const tt = (label: string) => ({ contentStyle: { background: "#0d1117", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "var(--muted)" }, itemStyle: { color: "var(--text)" }, cursor: { fill: "#ffffff08" } });

  return (
    <div>
      {/* 1. R-vs-C signature scatter */}
      <Box title="Type-I vs Type-II signature map (R vs C)"
        note="Each point is a scored biomarker: x = rupture/Type-I responsiveness (R), y = confounder/Type-II responsiveness (C). Bottom-right = rises with plaque rupture but NOT with demand drivers (ideal Type-I-specific). Top-right = rises with both (e.g. troponin). Color = discrimination class. Click a point to open the molecule.">
        <div style={{ marginBottom: 8 }}>
          <select value={scTier} onChange={(e) => setScTier(e.target.value)} style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "6px 10px", fontSize: 12.5 }}>
            <option value="all">All scored markers ({a.scatter_RC.length})</option>
            <option value="tier1">Deep-scored (Tier 1) only</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 12, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid stroke="#ffffff10" />
            <ReferenceArea x1={50} x2={100} y1={0} y2={33} fill="#43d17a" fillOpacity={0.06} />
            <ReferenceLine x={50} stroke="#ffffff22" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="#ffffff22" strokeDasharray="4 4" />
            <XAxis type="number" dataKey="R" name="Rupture (R)" domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b98a9" }} label={{ value: "Rupture / Type-I responsiveness (R) →", position: "bottom", fill: "#8b98a9", fontSize: 12 }} />
            <YAxis type="number" dataKey="C" name="Confounder (C)" domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b98a9" }} label={{ value: "Confounder / Type-II responsiveness (C) →", angle: -90, position: "insideLeft", fill: "#8b98a9", fontSize: 12 }} />
            <ZAxis type="number" dataKey="npmids" range={[24, 260]} name="PMIDs" />
            <Tooltip {...tt("")} formatter={(v, n) => [v, n]} labelFormatter={() => ""}
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const p = payload[0].payload as A["scatter_RC"][0];
                return <div style={{ background: "#0d1117", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, padding: "7px 10px" }}>
                  <div style={{ fontWeight: 700 }}>{p.n}</div>
                  <div style={{ color: "var(--muted)" }}>R={p.R} · C={p.C} · {p.npmids} PMIDs</div>
                  <div style={{ color: CLASS_COLOR[p.cls] }}>{p.cls}</div>
                </div>;
              }} />
            {Object.entries(scatterData).map(([cls, rows]) => (
              <Scatter key={cls} name={cls} data={rows} fill={CLASS_COLOR[cls] ?? "#8b98a9"} fillOpacity={0.72}
                onClick={(d) => d && router.push(`/molecule/${(d as unknown as { id: string }).id}`)} style={{ cursor: "pointer" }} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 28 }} />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* 2. discrimination class by step */}
        <Box title="Discrimination class by pathway step"
          note="How each cascade step's molecules distribute across T1-vs-T2 classes. Hover for counts.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.step_class} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="step" width={104} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              {CLASS_ORDER.map((c) => <Bar key={c} dataKey={c} stackId="s" fill={CLASS_COLOR[c]} />)}
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 3. evidence coverage by axis */}
        <Box title="Scoring coverage by evidence axis"
          note="How many of the 1,969 molecules carry each kind of scored evidence. The steep drop to direct T1-vs-T2 studies (D) is the core data gap.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.coverage_axes} layout="vertical" margin={{ left: 8, right: 30 }}>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" domain={[0, 2000]} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="axis" width={150} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 11 }}>
                {a.coverage_axes.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 4. evidence source by step */}
        <Box title="Evidence sources by pathway step"
          note="Molecules with each evidence type at each step (literature, trials, omics, genetic, druggable).">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.evidence_by_step} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="step" width={104} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              {Object.keys(EVID_COLOR).map((k) => <Bar key={k} dataKey={k} fill={EVID_COLOR[k]} />)}
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 5. assay method families */}
        <Box title="Assay method families"
          note="How the whole catalog would be measured — dominated by immunoassay, with mass-spec/NMR for metabolites & lipids.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.assay_methods} layout="vertical" margin={{ left: 8, right: 30 }}>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="method" width={130} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" fill="#72b7b2" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>

      {/* 6. specimen tubes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Box title="Specimen collection tubes"
          note="Primary blood-collection tube per marker (color-coded phlebotomy standard). K2-EDTA whole-blood entries are the gene-locus/genotyping records.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={a.assay_tubes} layout="vertical" margin={{ left: 8, right: 30 }}>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="tube" width={150} tick={{ fontSize: 9.5, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" fill="#c77dff" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 7. assay validation status */}
        <Box title="Assay validation status"
          note="Whether each marker's assay profile is a specific validated clinical assay, a specialized reference method, or a class-level default inferred from analyte type.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={a.assay_flag} margin={{ left: 8, right: 12, bottom: 10 }}>
              <CartesianGrid stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="flag" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" radius={[4, 4, 0, 0]} label={{ position: "top", fill: "#8b98a9", fontSize: 11 }}>
                <Cell fill="#43d17a" /><Cell fill="#8b98a9" /><Cell fill="#f2c14e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>

      {/* 7b. Evidence-source overlap (UpSet-style) */}
      <Box title="Evidence-source co-occurrence (UpSet)"
        note="How evidence types stack up per marker. Each row is a combination of sources; the bar is how many molecules have exactly that set. Dots below mark which sources are in each combination.">
        <EvidenceUpset upset={a.upset} setsize={a.setsize} />
      </Box>

      {/* 7c. Mechanism keyword frequency */}
      <Box title="Mechanism vocabulary frequency"
        note="How often each mechanistic concept appears across all 1,969 curated mechanism descriptions — the biology the catalog is built on.">
        <ResponsiveContainer width="100%" height={Math.max(320, a.mech_kw.length * 16)}>
          <BarChart data={a.mech_kw} layout="vertical" margin={{ left: 8, right: 34 }}>
            <CartesianGrid stroke="#ffffff10" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
            <YAxis type="category" dataKey="kw" width={168} tick={{ fontSize: 10, fill: "#8b98a9" }} interval={0} />
            <Tooltip {...tt("")} />
            <Bar dataKey="n" fill="#4cc9f0" radius={[0, 3, 3, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* 8. T1DI leaderboard */}
      <Box title="Top discriminators by T1DI (deep-scored)"
        note="Highest Type-I Discrimination Index among Tier-1 markers. Click a row to open the molecule. Color = class.">
        {a.t1di_top.map((d, i) => (
          <div key={d.id} onClick={() => router.push(`/molecule/${d.id}`)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", cursor: "pointer", fontSize: 12.5, borderBottom: "1px solid #ffffff08" }}>
            <span style={{ width: 18, color: "var(--muted)", textAlign: "right" }}>{i + 1}</span>
            <span style={{ width: 210, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.n}</span>
            <div style={{ flex: 1, height: 13, background: "#ffffff08", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${d.T1DI}%`, height: "100%", background: CLASS_COLOR[d.cls] ?? "#4cc9f0" }} />
            </div>
            <span style={{ width: 34, textAlign: "right", fontWeight: 700 }}>{d.T1DI.toFixed(0)}</span>
            <span style={{ width: 150, fontSize: 10.5, color: CLASS_COLOR[d.cls] ?? "#8b98a9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.cls}</span>
          </div>
        ))}
      </Box>
    </div>
  );
}

const UPSET_SETS = ["Lit", "Trials", "Omics", "Genetic", "Drug"];
const UPSET_LABEL: Record<string, string> = { Lit: "Literature", Trials: "Trials", Omics: "Omics", Genetic: "Genetic", Drug: "Druggable" };
function EvidenceUpset({ upset, setsize }: { upset: { combo: string[]; label: string; n: number }[]; setsize: Record<string, number> }) {
  const max = Math.max(...upset.map((u) => u.n));
  const colW = 46;
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 170, paddingLeft: 128 }}>
        {upset.map((u) => (
          <div key={u.label} title={`${u.label}: ${u.n}`} style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <span style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>{u.n}</span>
            <div style={{ width: 26, height: `${(u.n / max) * 130}px`, background: "#4cc9f0", borderRadius: "3px 3px 0 0" }} />
          </div>
        ))}
      </div>
      {UPSET_SETS.map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, height: 26 }}>
          <div style={{ width: 122, textAlign: "right", fontSize: 11, color: "var(--muted)", paddingRight: 6 }}>
            {UPSET_LABEL[s]} <span style={{ opacity: 0.6 }}>({setsize[s]?.toLocaleString?.() ?? setsize[s]})</span>
          </div>
          {upset.map((u) => {
            const on = u.combo.includes(s);
            return <div key={u.label + s} style={{ width: colW, display: "flex", justifyContent: "center" }}>
              <span style={{ width: 13, height: 13, borderRadius: "50%", background: on ? "#43d17a" : "#2a3441" }} />
            </div>;
          })}
        </div>
      ))}
    </div>
  );
}
