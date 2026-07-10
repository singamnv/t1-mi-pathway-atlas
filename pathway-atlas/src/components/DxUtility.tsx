"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DxRecord } from "@/lib/data";

type DimKey = "feasibility" | "evidence" | "rupture" | "demand_spec" | "direct_t1" | "novelty" | "dx_performance" | "dx_kinetics" | "dx_incremental";
const DIMS: { key: DimKey; label: string; hint: string; color: string }[] = [
  { key: "rupture",     label: "Plaque-rupture signal", hint: "Rises with atherothrombotic plaque rupture (Type-I responsiveness)", color: "#4cc9f0" },
  { key: "demand_spec", label: "Specificity vs demand", hint: "Specificity against Type-II drivers — sepsis, hypotension, bleeding, tachycardia, hypoxemia (inverted confounder score)", color: "#f2854e" },
  { key: "direct_t1",   label: "Direct T1 > T2 evidence", hint: "Head-to-head studies showing the marker is higher in Type-I than Type-II MI", color: "#43d17a" },
  { key: "dx_performance", label: "Diagnostic performance", hint: "Reported sensitivity/specificity/AUC for detecting MI (extracted from accuracy studies)", color: "#ff6b9d" },
  { key: "dx_kinetics", label: "Release kinetics", hint: "How early the marker rises after symptom onset — governs early rule-out / 0-1h algorithms", color: "#c77dff" },
  { key: "dx_incremental", label: "Incremental vs troponin", hint: "What the marker adds ON TOP of high-sensitivity troponin (added AUC / reclassification)", color: "#ffd166" },
  { key: "feasibility", label: "Assay feasibility", hint: "How easily measured — specimen, platform, turnaround", color: "#72b7b2" },
  { key: "evidence",    label: "Evidence strength", hint: "Volume, study design and directness of supporting data", color: "#9d8df1" },
  { key: "novelty",     label: "Novelty", hint: "Under-explored as a Type-I diagnostic (incumbents like troponin score low)", color: "#e0c04a" },
];
const Z: Record<DimKey, number> = { rupture: 0, demand_spec: 0, direct_t1: 0, dx_performance: 0, dx_kinetics: 0, dx_incremental: 0, feasibility: 0, evidence: 0, novelty: 0 };
const PRESETS: { name: string; w: Record<DimKey, number>; note: string }[] = [
  { name: "Rule-in Type I", note: "Confirm atherothrombosis over demand ischemia", w: { ...Z, rupture: 90, demand_spec: 100, direct_t1: 90, feasibility: 40, evidence: 50, novelty: 10 } },
  { name: "Deployable today", note: "Bedside-ready, strong evidence", w: { ...Z, rupture: 60, demand_spec: 60, direct_t1: 50, feasibility: 100, evidence: 90, dx_performance: 60 } },
  { name: "Best diagnostic test", note: "Accuracy + early rise + adds to troponin", w: { ...Z, dx_performance: 100, dx_kinetics: 80, dx_incremental: 90, demand_spec: 60, feasibility: 60 } },
  { name: "Novel discovery", note: "Under-explored, mechanism-specific", w: { ...Z, rupture: 80, demand_spec: 80, direct_t1: 40, feasibility: 20, evidence: 20, novelty: 100 } },
  { name: "Balanced", note: "Equal weight", w: { rupture: 50, demand_spec: 50, direct_t1: 50, dx_performance: 50, dx_kinetics: 50, dx_incremental: 50, feasibility: 50, evidence: 50, novelty: 50 } },
];

const CLASS_COLOR: Record<string, string> = {
  "Type-I-specific": "#43d17a", "Type-I-leaning (direct)": "#8fe3a8", "Type-II-associated": "#f2854e",
  "Shared / rises in both": "#e0c04a", "Indeterminate": "#8b98a9", "Low-confidence (proxy)": "#5a6675", "Insufficient evidence": "#3a4550",
};

export default function DxUtility({ rows }: { rows: DxRecord[] }) {
  const router = useRouter();
  const [w, setW] = useState<Record<DimKey, number>>(PRESETS[0].w);
  const [tier, setTier] = useState("scored");
  const [penalize, setPenalize] = useState(true);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(40);

  const scored = useMemo(() => {
    const wsum = DIMS.reduce((s, d) => s + w[d.key], 0) || 1;
    const out = rows.map((r) => {
      let acc = 0, wused = 0, missing = 0;
      for (const d of DIMS) {
        const v = r[d.key];
        if (v == null) { missing += w[d.key]; continue; }
        acc += (v / 100) * w[d.key]; wused += w[d.key];
      }
      // score over weight actually covered; optionally penalize missing-data dims
      let score = wused > 0 ? (acc / (penalize ? wsum : wused)) * 100 : 0;
      score = Math.max(0, Math.min(100, score));
      return { ...r, score, coverage: 1 - missing / wsum };
    });
    return out;
  }, [rows, w, penalize]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let f = scored;
    if (tier === "scored") f = f.filter((r) => r.tier !== "tier3_insufficient");
    else if (tier === "tier1_deep") f = f.filter((r) => r.tier === "tier1_deep");
    if (ql) f = f.filter((r) => (r.name + " " + (r.gene ?? "")).toLowerCase().includes(ql));
    return [...f].sort((a, b) => b.score - a.score);
  }, [scored, tier, q]);

  const top = filtered.slice(0, 15);
  const maxScore = top[0]?.score || 100;

  const card: React.CSSProperties = { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" };
  const inputStyle: React.CSSProperties = { background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "8px 11px", fontSize: 13, outline: "none" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
      {/* Controls */}
      <div style={{ ...card, position: "sticky", top: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Weight the criteria</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Drag to set how much each dimension matters. Ranking updates live.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {PRESETS.map((p) => (
            <button key={p.name} title={p.note} onClick={() => setW(p.w)}
              style={{ ...inputStyle, cursor: "pointer", fontSize: 12, padding: "5px 9px" }}>{p.name}</button>
          ))}
        </div>
        {DIMS.map((d) => (
          <div key={d.key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
              <span title={d.hint} style={{ color: "var(--text)", borderBottom: "1px dotted var(--border)", cursor: "help" }}>{d.label}</span>
              <span style={{ color: d.color, fontWeight: 700 }}>{w[d.key]}</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={w[d.key]}
              onChange={(e) => setW({ ...w, [d.key]: Number(e.target.value) })}
              style={{ width: "100%", accentColor: d.color }} />
          </div>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--muted)", marginTop: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={penalize} onChange={(e) => setPenalize(e.target.checked)} />
          Penalize missing data (markers with gaps rank lower)
        </label>
      </div>

      {/* Results */}
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input placeholder="Search name or gene…" value={q} onChange={(e) => { setQ(e.target.value); setLimit(40); }} style={{ ...inputStyle, flex: "1 1 180px" }} />
          <select value={tier} onChange={(e) => setTier(e.target.value)} style={inputStyle}>
            <option value="scored">Scored markers (evidence-backed)</option>
            <option value="tier1_deep">Tier 1 — deep-scored only</option>
            <option value="all">All 1,969 (incl. insufficient)</option>
          </select>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{filtered.length} ranked</span>
        </div>

        {/* Top-15 bar chart */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Top 15 by your weighting</div>
          {top.map((r, i) => (
            <div key={r.mol_id} onClick={() => router.push(`/molecule/${r.mol_id}`)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "3px 0", cursor: "pointer", fontSize: 12.5 }}>
              <span style={{ width: 18, color: "var(--muted)", textAlign: "right" }}>{i + 1}</span>
              <span style={{ width: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
              <div style={{ flex: 1, height: 14, background: "#ffffff08", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(r.score / maxScore) * 100}%`, height: "100%", background: "linear-gradient(90deg,#4cc9f0,#43d17a)" }} />
              </div>
              <span style={{ width: 34, textAlign: "right", fontWeight: 700 }}>{r.score.toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Ranked table */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ maxHeight: "60vh", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, background: "var(--bg)" }}>
                  {["#", "Marker", "Score", "Rupt", "Dem.spec", "T1>T2", "Perf", "Kin", "Incr", "Feas", "Evid", "Novel", "Class"].map((h) => (
                    <th key={h} style={{ padding: "8px 9px", textAlign: h === "Marker" || h === "Class" ? "left" : "right", color: "var(--muted)", fontWeight: 600, fontSize: 11.5, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, limit).map((r, i) => (
                  <tr key={r.mol_id} onClick={() => router.push(`/molecule/${r.mol_id}`)}
                    style={{ cursor: "pointer", borderBottom: "1px solid #ffffff08" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff08")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "7px 9px", textAlign: "right", color: "var(--muted)" }}>{i + 1}</td>
                    <td style={{ padding: "7px 9px", fontWeight: 600 }}>{r.name}{r.gene && <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 11, marginLeft: 5, fontFamily: "ui-monospace,monospace" }}>{r.gene}</span>}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right", fontWeight: 700, color: "#43d17a" }}>{r.score.toFixed(0)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.rupture)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.demand_spec)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.direct_t1)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.dx_performance ?? null)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.dx_kinetics ?? null)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.dx_incremental ?? null)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.feasibility)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.evidence)}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" }}>{cell(r.novelty)}</td>
                    <td style={{ padding: "7px 9px" }}>
                      <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, whiteSpace: "nowrap", background: (CLASS_COLOR[r.cls ?? ""] ?? "#8b98a9") + "22", color: CLASS_COLOR[r.cls ?? ""] ?? "#8b98a9" }}>{r.cls}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {filtered.length > limit && (
          <button onClick={() => setLimit((l) => l + 100)} style={{ ...inputStyle, marginTop: 12, width: "100%", cursor: "pointer", fontWeight: 600 }}>
            Show more ({filtered.length - limit} remaining)
          </button>
        )}
      </div>
    </div>
  );
}
function cell(v: number | null) {
  if (v == null) return <span style={{ color: "#4b5563" }}>—</span>;
  return <span style={{ color: "var(--text)" }}>{v.toFixed(0)}</span>;
}
