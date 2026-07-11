"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ReferenceLine, ReferenceArea, Legend, Customized,
} from "recharts";
import ChartHelp from "@/components/ChartHelp";

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

  const tt = (label: string) => ({ contentStyle: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "var(--muted)" }, itemStyle: { color: "var(--text)" }, cursor: { fill: "var(--track)" } });

  return (
    <div>
      {/* Scoring glossary — defines the vocabulary used by every chart below */}
      <details style={{ ...card, background: "var(--panel-2)" }}>
        <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--text)", listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--accent)" }}>ⓘ</span> Scoring glossary — what R, C, D, T1DI and the classes mean
        </summary>
        <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.65, color: "var(--text-2)", display: "grid", gap: 8 }}>
          <div><b style={{ color: "var(--text)" }}>R — Rupture / Type-I responsiveness (0–100).</b> How strongly a marker tracks the plaque-rupture / atherothrombotic process that defines a <b>Type&nbsp;1</b> MI. Higher = more responsive to rupture biology.</div>
          <div><b style={{ color: "var(--text)" }}>C — Confounder / Type-II responsiveness (0–100).</b> How strongly the same marker also rises with supply–demand mismatch (tachycardia, anemia, sepsis) — the drivers of a <b>Type&nbsp;2</b> MI. Higher = less specific to Type&nbsp;1.</div>
          <div><b style={{ color: "var(--text)" }}>D — Direct evidence.</b> Whether a marker has been tested in a study that <i>directly</i> compares Type&nbsp;1 vs Type&nbsp;2 patients (as opposed to inferred from mechanism). Only a handful of markers have this.</div>
          <div><b style={{ color: "var(--text)" }}>T1DI — Type-I Discrimination Index (0–100).</b> A composite that rewards high R, penalizes high C, and up-weights markers with direct evidence. It is the single ranking score for “how cleanly does this separate Type&nbsp;1 from Type&nbsp;2?”</div>
          <div><b style={{ color: "var(--text)" }}>Tiers.</b> <b>Tier&nbsp;1 (deep-scored)</b> markers were individually reviewed with full R/C/D scoring; the rest carry lighter, mechanism-derived estimates. Filter to Tier&nbsp;1 when you want the most defensible numbers.</div>
          <div><b style={{ color: "var(--text)" }}>Discrimination classes.</b> <span style={{ color: CLASS_COLOR["Type-I-specific"] }}>Type-I-specific</span> = high R, low C · <span style={{ color: CLASS_COLOR["Shared / rises in both"] }}>Shared</span> = rises in both (e.g. troponin) · <span style={{ color: CLASS_COLOR["Type-II-associated"] }}>Type-II-associated</span> = tracks demand drivers · the greyed classes flag proxy-only or insufficient evidence.</div>
        </div>
      </details>

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
            <CartesianGrid stroke="var(--grid)" />
            <ReferenceArea x1={50} x2={100} y1={0} y2={33} fill="#43d17a" fillOpacity={0.06} />
            <ReferenceLine x={50} stroke="var(--gridline)" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="var(--gridline)" strokeDasharray="4 4" />
            <XAxis type="number" dataKey="R" name="Rupture (R)" domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b98a9" }} label={{ value: "Rupture / Type-I responsiveness (R) →", position: "bottom", fill: "#8b98a9", fontSize: 12 }} />
            <YAxis type="number" dataKey="C" name="Confounder (C)" domain={[0, 100]} tick={{ fontSize: 11, fill: "#8b98a9" }} label={{ value: "Confounder / Type-II responsiveness (C) →", angle: -90, position: "insideLeft", fill: "#8b98a9", fontSize: 12 }} />
            <ZAxis type="number" dataKey="npmids" range={[24, 260]} name="PMIDs" />
            <Tooltip {...tt("")} formatter={(v, n) => [v, n]} labelFormatter={() => ""}
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const p = payload[0].payload as A["scatter_RC"][0];
                return <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, padding: "7px 10px" }}>
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
        <ChartHelp
          what={<>The core view: every scored biomarker plotted by <b>R</b> (x, rupture / Type-I responsiveness) against <b>C</b> (y, confounder / Type-II responsiveness). Dot size scales with how many PubMed articles support the marker; color is its discrimination class.</>}
          read={<>Read the quadrants. <b>Bottom-right</b> (high R, low C — shaded green) is the prize: rises with plaque rupture but not with demand drivers, i.e. Type-I-specific. <b>Top-right</b> rises with both (troponin lives here). <b>Left half</b> is weakly rupture-linked. The dashed lines mark the R=50 / C=50 midpoints. Click any dot to open that molecule.</>}
          takeaway={<>Ideal Type-1 discriminators sit low and to the right. The scarcity of well-supported (large) dots in the bottom-right corner is exactly why Type&nbsp;1 vs Type&nbsp;2 separation is hard. Use the Tier-1 filter to see only deep-scored markers.</>}
        />
      </Box>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* 2. discrimination class by step */}
        <Box title="Discrimination class by pathway step"
          note="How each cascade step's molecules distribute across T1-vs-T2 classes. Hover for counts.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.step_class} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid stroke="var(--grid)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="step" width={104} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              {CLASS_ORDER.map((c) => <Bar key={c} dataKey={c} stackId="s" fill={CLASS_COLOR[c]} />)}
            </BarChart>
          </ResponsiveContainer>
          <ChartHelp
            what={<>For each cascade step, the mix of discrimination classes among its molecules — a horizontal stacked bar broken into Type-I-specific, Shared, Type-II-associated and the lower-evidence classes (see glossary).</>}
            read={<>Bar length = molecules scored at that step; each colored segment is one class. More green (Type-I-specific / -leaning) means that step contributes more markers that separate Type&nbsp;1 from Type&nbsp;2.</>}
            takeaway={<>Locates the discriminating biology: steps weighted toward green are the mechanistic origin of Type-1-specific signal; steps dominated by grey/amber are mostly shared or under-evidenced.</>}
          />
        </Box>

        {/* 3. evidence coverage by axis */}
        <Box title="Scoring coverage by evidence axis"
          note="How many of the 1,969 molecules carry each kind of scored evidence. The steep drop to direct T1-vs-T2 studies (D) is the core data gap.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.coverage_axes} layout="vertical" margin={{ left: 8, right: 30 }}>
              <CartesianGrid stroke="var(--grid)" horizontal={false} />
              <XAxis type="number" domain={[0, 2000]} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="axis" width={150} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 11 }}>
                {a.coverage_axes.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ChartHelp
            what={<>How many of the {(1969).toLocaleString()} molecules carry each kind of scored evidence — running from broad, easily-available evidence down to the rare direct Type-1-vs-Type-2 (D) studies.</>}
            read={<>Longer bar = more molecules have that evidence axis. The axes are ordered so you can see the drop-off from abundant evidence at the top to scarce evidence at the bottom.</>}
            takeaway={<>The steep fall to the <b>direct T1-vs-T2 (D)</b> bar is the central data gap: almost every marker is scored from indirect mechanism, and only a few have head-to-head clinical comparison. This is the honest limitation behind every other chart.</>}
          />
        </Box>

        {/* 4. evidence source by step */}
        <Box title="Evidence sources by pathway step"
          note="Molecules with each evidence type at each step (literature, trials, omics, genetic, druggable).">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.evidence_by_step} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid stroke="var(--grid)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="step" width={104} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              {Object.keys(EVID_COLOR).map((k) => <Bar key={k} dataKey={k} fill={EVID_COLOR[k]} />)}
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
          <ChartHelp
            what={<>The same five evidence sources (literature, trials, omics, genetic, druggable) counted <b>per cascade step</b> — grouped bars rather than a single stack, so each source is directly comparable across steps.</>}
            read={<>Within a step, compare the colored bars to see which evidence type dominates there; across steps, scan one color to see where that evidence concentrates.</>}
            takeaway={<>Reveals the texture behind each step: some are propped up almost entirely by literature, while steps with visible genetic or trial bars have stronger causal or interventional backing.</>}
          />
        </Box>

        {/* 5. assay method families */}
        <Box title="Assay method families"
          note="How the whole catalog would be measured — dominated by immunoassay, with mass-spec/NMR for metabolites & lipids.">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={a.assay_methods} layout="vertical" margin={{ left: 8, right: 30 }}>
              <CartesianGrid stroke="var(--grid)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="method" width={130} tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" fill="#72b7b2" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
          <ChartHelp
            what={<>The laboratory method each marker would be measured by, tallied across the catalog — immunoassay, mass spectrometry, NMR, clinical chemistry, nucleic-acid assays, and so on.</>}
            read={<>Longer bar = more markers use that method family. The mix follows directly from the molecule-type composition (proteins → immunoassay, metabolites/lipids → MS/NMR).</>}
            takeaway={<>A practical read on panel logistics: an immunoassay-dominated panel is the most deployable on existing hospital analyzers, while heavy mass-spec reliance implies specialized reference-lab workflows.</>}
          />
        </Box>
      </div>

      {/* 6. specimen tubes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Box title="Specimen collection tubes"
          note="Primary blood-collection tube per marker (color-coded phlebotomy standard). K2-EDTA whole-blood entries are the gene-locus/genotyping records.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={a.assay_tubes} layout="vertical" margin={{ left: 8, right: 30 }}>
              <CartesianGrid stroke="var(--grid)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis type="category" dataKey="tube" width={150} tick={{ fontSize: 9.5, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" fill="#c77dff" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
          <ChartHelp
            what={<>The primary blood-collection tube each marker needs, using the standard color-coded phlebotomy convention (e.g. SST/gold for serum, lavender/K2-EDTA for plasma and genotyping).</>}
            read={<>Longer bar = more markers drawn into that tube type. The K2-EDTA whole-blood entries are the gene-locus / genotyping records rather than circulating analytes.</>}
            takeaway={<>Shows how few distinct draws a combined panel would actually require — markers sharing a tube can be co-collected, which matters for real-world phlebotomy and assay batching.</>}
          />
        </Box>

        {/* 7. assay validation status */}
        <Box title="Assay validation status"
          note="Whether each marker's assay profile is a specific validated clinical assay, a specialized reference method, or a class-level default inferred from analyte type.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={a.assay_flag} margin={{ left: 8, right: 12, bottom: 10 }}>
              <CartesianGrid stroke="var(--grid)" vertical={false} />
              <XAxis dataKey="flag" tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <YAxis tick={{ fontSize: 10, fill: "#8b98a9" }} />
              <Tooltip {...tt("")} />
              <Bar dataKey="n" radius={[4, 4, 0, 0]} label={{ position: "top", fill: "#8b98a9", fontSize: 11 }}>
                <Cell fill="#43d17a" /><Cell fill="#8b98a9" /><Cell fill="#f2c14e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <ChartHelp
            what={<>How well-established each marker&apos;s assay profile is: a <b>specific validated</b> clinical assay, a <b>specialized reference</b> method, or a <b>class-level default</b> inferred from the analyte type rather than an actual named assay.</>}
            read={<>Each bar is one status category; height = number of markers. Taller “validated” bar = more of the catalog is measurable with an off-the-shelf clinical assay today.</>}
            takeaway={<>A maturity check on measurability: validated markers could be deployed now, while class-default entries are aspirational and would need real assay development before use.</>}
          />
        </Box>
      </div>

      {/* 7b. Evidence-source overlap (UpSet-style) */}
      <Box title="Evidence-source co-occurrence (UpSet)"
        note="How evidence types stack up per marker. Each row is a combination of sources; the bar is how many molecules have exactly that set. Dots below mark which sources are in each combination.">
        <EvidenceUpset upset={a.upset} setsize={a.setsize} />
        <ChartHelp
          what={<>An UpSet plot — the readable alternative to a 5-way Venn diagram. It shows how the five evidence sources <b>combine</b> per marker: each column is one exact combination of sources.</>}
          read={<>The dots under a column show which sources are in that set; the bar above is how many molecules have <i>exactly</i> that combination (not more, not fewer). The row labels on the left give each source&apos;s total set size.</>}
          takeaway={<>The largest columns are typically literature-only and literature+druggable, quantifying how many markers rest on a single evidence type versus how few are corroborated across genetics, trials and omics together.</>}
        />
      </Box>

      {/* 7c. Mechanism keyword frequency */}
      <Box title="Mechanism vocabulary frequency"
        note="How often each mechanistic concept appears across all 1,969 curated mechanism descriptions — the biology the catalog is built on.">
        <ResponsiveContainer width="100%" height={Math.max(320, a.mech_kw.length * 16)}>
          <BarChart data={a.mech_kw} layout="vertical" margin={{ left: 8, right: 34 }}>
            <CartesianGrid stroke="var(--grid)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#8b98a9" }} />
            <YAxis type="category" dataKey="kw" width={168} tick={{ fontSize: 10, fill: "#8b98a9" }} interval={0} />
            <Tooltip {...tt("")} />
            <Bar dataKey="n" fill="#4cc9f0" radius={[0, 3, 3, 0]} label={{ position: "right", fill: "#8b98a9", fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
        <ChartHelp
          what={<>The most frequent mechanistic concepts across all {(1969).toLocaleString()} curated one-line mechanism descriptions — a word/phrase frequency count over the biology the catalog was built on (phrases appearing ≥5 times).</>}
          read={<>Longer bar = the concept is invoked for more molecules. It reflects how often a mechanism is <i>described</i>, not a formal ontology mapping.</>}
          takeaway={<>Surfaces the dominant biological themes of the atlas — inflammation, signaling, platelet activation — giving a quick sense of which processes the Type-1 cascade literature centers on.</>}
        />
      </Box>

      {/* 8. T1DI leaderboard */}
      <Box title="Top discriminators by T1DI (deep-scored)"
        note="Highest Type-I Discrimination Index among Tier-1 markers. Click a row to open the molecule. Color = class.">
        {a.t1di_top.map((d, i) => (
          <div key={d.id} onClick={() => router.push(`/molecule/${d.id}`)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", cursor: "pointer", fontSize: 12.5, borderBottom: "1px solid var(--hairline)" }}>
            <span style={{ width: 18, color: "var(--muted)", textAlign: "right" }}>{i + 1}</span>
            <span style={{ width: 210, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.n}</span>
            <div style={{ flex: 1, height: 13, background: "var(--track)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${d.T1DI}%`, height: "100%", background: CLASS_COLOR[d.cls] ?? "#4cc9f0" }} />
            </div>
            <span style={{ width: 34, textAlign: "right", fontWeight: 700 }}>{d.T1DI.toFixed(0)}</span>
            <span style={{ width: 150, fontSize: 10.5, color: CLASS_COLOR[d.cls] ?? "#8b98a9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.cls}</span>
          </div>
        ))}
        <ChartHelp
          what={<>The Tier-1 (deep-scored) markers ranked by <b>T1DI</b>, the composite Type-I Discrimination Index (see glossary) — the atlas&apos;s single best answer to “which markers most cleanly separate Type&nbsp;1 from Type&nbsp;2?”</>}
          read={<>Rows are sorted high-to-low; the bar length and the number are the T1DI (0–100), and the bar color is the marker&apos;s discrimination class. Click any row to open that molecule&apos;s evidence page.</>}
          takeaway={<>This is the shortlist to act on. Because T1DI rewards direct evidence, high-ranking markers are both mechanistically Type-1-leaning and comparatively well-supported — the strongest candidates for a discriminating panel.</>}
        />
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
              <span style={{ width: 13, height: 13, borderRadius: "50%", background: on ? "#43d17a" : "#cbd5e1" }} />
            </div>;
          })}
        </div>
      ))}
    </div>
  );
}
