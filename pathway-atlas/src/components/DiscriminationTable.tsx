"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscRecord } from "@/lib/types";

type SortKey = "name" | "T1DI" | "spec_final" | "R_score" | "C_score" | "D_score" | "A_score" | "E_score" | "n_pmids";

const CLASS_COLOR: Record<string, string> = {
  "Type-I-specific": "#43d17a",
  "Type-I-leaning (direct)": "#8fe3a8",
  "Type-II-associated": "#f2854e",
  "Shared / rises in both": "#e0c04a",
  "Indeterminate": "#8b98a9",
  "Low-confidence (proxy)": "#5a6675",
  "Insufficient evidence": "#3a4550",
};
function classColor(c: string) { return CLASS_COLOR[c] ?? "#8b98a9"; }

function scoreCell(v: number | null, kind: "R" | "C" | "spec" | "T1DI" | "plain" = "plain") {
  if (v === null || v === undefined) return <span style={{ color: "#4b5563" }}>—</span>;
  let color = "var(--text)";
  if (kind === "R") color = "#4cc9f0";
  else if (kind === "C") color = "#f2854e";
  else if (kind === "spec") color = v > 0 ? "#43d17a" : v < 0 ? "#f2854e" : "#8b98a9";
  else if (kind === "T1DI") color = "#b388eb";
  return <span style={{ color, fontWeight: kind === "T1DI" ? 700 : 500 }}>{typeof v === "number" ? v.toFixed(kind === "T1DI" || kind === "spec" ? 1 : 0) : v}</span>;
}

export default function DiscriminationTable({ rows }: { rows: DiscRecord[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [tier, setTier] = useState("tier1_deep");
  const [directOnly, setDirectOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("T1DI");
  const [asc, setAsc] = useState(false);
  const [limit, setLimit] = useState(60);

  const classes = useMemo(() => Array.from(new Set(rows.map((r) => r.disc_class))), [rows]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (tier !== "all" && r.tier !== tier) return false;
      if (cls !== "all" && r.disc_class !== cls) return false;
      if (directOnly && r.D_score === null) return false;
      if (ql) {
        const hay = (r.name + " " + (r.gene_symbol ?? "")).toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;   // nulls last
      if (bv === null) return -1;
      if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av;
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return out;
  }, [rows, q, cls, tier, directOnly, sortKey, asc]);

  const shown = filtered.slice(0, limit);
  function toggleSort(k: SortKey) {
    if (k === sortKey) setAsc((v) => !v);
    else { setSortKey(k); setAsc(k === "name"); }
    setLimit(60);
  }
  const inputStyle: React.CSSProperties = {
    background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)",
    borderRadius: 8, padding: "8px 11px", fontSize: 13, outline: "none",
  };
  const th = (k: SortKey, label: string, title: string) => (
    <th onClick={() => toggleSort(k)} title={title}
        style={{ textAlign: "right", padding: "9px 10px", cursor: "pointer", userSelect: "none",
                 color: sortKey === k ? "var(--text)" : "var(--muted)", fontWeight: 600, fontSize: 12,
                 borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--bg)" }}>
      {label}{sortKey === k ? (asc ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <input placeholder="Search name or gene…" value={q}
               onChange={(e) => { setQ(e.target.value); setLimit(60); }}
               style={{ ...inputStyle, flex: "1 1 200px", minWidth: 170 }} />
        <select value={tier} onChange={(e) => { setTier(e.target.value); setLimit(60); }} style={inputStyle}>
          <option value="tier1_deep">Tier 1 — deep-scored (335)</option>
          <option value="tier2_light">Tier 2 — proxy (725)</option>
          <option value="all">All tiers</option>
        </select>
        <select value={cls} onChange={(e) => { setCls(e.target.value); setLimit(60); }} style={inputStyle}>
          <option value="all">All classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={directOnly} onChange={(e) => { setDirectOnly(e.target.checked); setLimit(60); }} />
          Direct T1-vs-T2 evidence only
        </label>
        <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: "auto" }}>{filtered.length} rows</span>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ maxHeight: "68vh", overflow: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th onClick={() => toggleSort("name")} style={{ textAlign: "left", padding: "9px 12px", cursor: "pointer", color: sortKey === "name" ? "var(--text)" : "var(--muted)", fontWeight: 600, fontSize: 12, borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)" }}>Marker{sortKey === "name" ? (asc ? " ▲" : " ▼") : ""}</th>
                <th style={{ textAlign: "left", padding: "9px 10px", color: "var(--muted)", fontWeight: 600, fontSize: 12, borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)" }}>Class</th>
                {th("R_score", "R", "Plaque-rupture / Type-I responsiveness (0-100)")}
                {th("C_score", "C", "Confounder / Type-II responsiveness (0-100, higher=worse)")}
                {th("D_score", "D", "Direct T1-vs-T2 differential (−3..+3, + = higher in T1)")}
                {th("spec_final", "spec", "Specificity differential R−C (+direct)")}
                {th("A_score", "A", "Assay feasibility (0-100)")}
                {th("E_score", "E", "Evidence strength (0-100)")}
                {th("T1DI", "T1DI", "Type-I Discrimination Index (0-100, composite)")}
                {th("n_pmids", "PMIDs", "Number of supporting PubMed references")}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.mol_id} onClick={() => router.push(`/molecule/${r.mol_id}`)}
                    style={{ cursor: "pointer", borderBottom: "1px solid var(--hairline)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--row-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                    {r.name}
                    {r.gene_symbol && <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 11, marginLeft: 6, fontFamily: "ui-monospace, monospace" }}>{r.gene_symbol}</span>}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 20, fontSize: 10.5, whiteSpace: "nowrap",
                                   background: classColor(r.disc_class) + "22", color: classColor(r.disc_class),
                                   border: `1px solid ${classColor(r.disc_class)}44` }}>
                      {r.disc_class}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{scoreCell(r.R_score, "R")}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{scoreCell(r.C_score, "C")}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }} title={r.D_finding ?? ""}>
                    {r.D_score === null ? <span style={{ color: "#4b5563" }}>—</span> :
                      <span style={{ color: r.D_score > 0 ? "#43d17a" : r.D_score < 0 ? "#f2854e" : "#8b98a9", fontWeight: 700 }}>
                        {r.D_score > 0 ? "+" : ""}{r.D_score}
                      </span>}
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{scoreCell(r.spec_final, "spec")}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{scoreCell(r.A_score)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{scoreCell(r.E_score)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{scoreCell(r.T1DI, "T1DI")}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "var(--muted)" }}>{r.n_pmids || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filtered.length > limit && (
        <button onClick={() => setLimit((l) => l + 120)}
                style={{ ...inputStyle, marginTop: 14, cursor: "pointer", fontWeight: 600, width: "100%" }}>
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
    </>
  );
}
