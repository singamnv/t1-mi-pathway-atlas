"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MoleculeSlim } from "@/lib/types";
import { STEP_COLOR } from "@/lib/stepColors";

interface StepOpt { id: string; short: string; }
type SortKey = "name" | "gene_symbol" | "mol_type" | "pathway_step" | "n_references" | "n_trials" | "step_confidence";

const confRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default function DataTable({ molecules, steps }: { molecules: MoleculeSlim[]; steps: StepOpt[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [step, setStep] = useState("all");
  const [type, setType] = useState("all");
  const [ev, setEv] = useState<"all" | "druggable" | "genetic" | "trials">("all");
  const [sortKey, setSortKey] = useState<SortKey>("n_references");
  const [asc, setAsc] = useState(false);
  const [limit, setLimit] = useState(100);

  const stepShort: Record<string, string> = Object.fromEntries(steps.map((s) => [s.id, s.short]));
  const types = useMemo(() => Array.from(new Set(molecules.map((m) => m.mol_type))).sort(), [molecules]);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const out = molecules.filter((m) => {
      if (step !== "all" && m.pathway_step !== step) return false;
      if (type !== "all" && m.mol_type !== type) return false;
      if (ev === "druggable" && !m.druggable) return false;
      if (ev === "genetic" && !m.has_genetic) return false;
      if (ev === "trials" && m.n_trials === 0) return false;
      if (ql) {
        const hay = (m.name + " " + (m.gene_symbol ?? "") + " " + m.mechanism).toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "step_confidence") { av = confRank[a.step_confidence]; bv = confRank[b.step_confidence]; }
      else { av = a[sortKey] ?? ""; bv = b[sortKey] ?? ""; }
      if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av;
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return out;
  }, [molecules, q, step, type, ev, sortKey, asc]);

  const shown = rows.slice(0, limit);
  function toggleSort(k: SortKey) {
    if (k === sortKey) setAsc((v) => !v);
    else { setSortKey(k); setAsc(k === "name" || k === "gene_symbol" || k === "mol_type"); }
    setLimit(100);
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)",
    borderRadius: 8, padding: "8px 11px", fontSize: 13, outline: "none",
  };
  const th = (k: SortKey, label: string, align: "left" | "right" = "left"): React.ReactNode => (
    <th onClick={() => toggleSort(k)}
        style={{ textAlign: align, padding: "9px 12px", cursor: "pointer", userSelect: "none",
                 color: sortKey === k ? "var(--text)" : "var(--muted)", fontWeight: 600, fontSize: 12,
                 borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0,
                 background: "var(--bg)" }}>
      {label}{sortKey === k ? (asc ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <input placeholder="Search name, gene, mechanism…" value={q}
               onChange={(e) => { setQ(e.target.value); setLimit(100); }}
               style={{ ...inputStyle, flex: "1 1 240px", minWidth: 190 }} />
        <select value={step} onChange={(e) => { setStep(e.target.value); setLimit(100); }} style={inputStyle}>
          <option value="all">All steps</option>
          {steps.map((s) => <option key={s.id} value={s.id}>{s.short}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setLimit(100); }} style={inputStyle}>
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={ev} onChange={(e) => { setEv(e.target.value as typeof ev); setLimit(100); }} style={inputStyle}>
          <option value="all">Any evidence</option>
          <option value="druggable">Druggable</option>
          <option value="genetic">Genetic</option>
          <option value="trials">In trials</option>
        </select>
        <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: "auto" }}>{rows.length.toLocaleString()} rows</span>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ maxHeight: "70vh", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {th("name", "Molecule")}
                {th("gene_symbol", "Gene")}
                {th("mol_type", "Type")}
                {th("pathway_step", "Step")}
                {th("n_references", "Refs", "right")}
                {th("n_trials", "Trials", "right")}
                {th("step_confidence", "Conf.")}
                <th style={{ padding: "9px 12px", textAlign: "center", color: "var(--muted)", fontWeight: 600, fontSize: 12, borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)" }}>Flags</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.mol_id}
                    onClick={() => router.push(`/molecule/${m.mol_id}`)}
                    style={{ cursor: "pointer", borderBottom: "1px solid var(--hairline)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--row-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: "8px 12px", fontFamily: "ui-monospace, monospace", color: "var(--muted)", fontSize: 12 }}>{m.gene_symbol ?? "—"}</td>
                  <td style={{ padding: "8px 12px", color: "var(--muted)" }}>{m.mol_type}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 20, fontSize: 11,
                                   background: (STEP_COLOR[m.pathway_step] ?? "#6b7a90") + "22",
                                   color: STEP_COLOR[m.pathway_step] ?? "#6b7a90",
                                   border: `1px solid ${(STEP_COLOR[m.pathway_step] ?? "#6b7a90")}44` }}>
                      {stepShort[m.pathway_step] ?? m.pathway_step}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>{m.n_references}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: m.n_trials ? "var(--text)" : "var(--muted)" }}>{m.n_trials || "—"}</td>
                  <td style={{ padding: "8px 12px", color: "var(--muted)", fontSize: 12 }}>{m.step_confidence}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                    {m.druggable && <span title="Druggable" style={{ color: "#be185d" }}>◆</span>}
                    {m.has_genetic && <span title="Genetic evidence" style={{ color: "#15803d", marginLeft: 4 }}>✦</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > limit && (
        <button onClick={() => setLimit((l) => l + 200)}
                style={{ ...inputStyle, marginTop: 14, cursor: "pointer", fontWeight: 600, width: "100%" }}>
          Show more ({rows.length - limit} remaining)
        </button>
      )}
    </>
  );
}
