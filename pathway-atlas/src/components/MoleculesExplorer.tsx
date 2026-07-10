"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MoleculeSlim } from "@/lib/types";
import { STEP_COLOR } from "@/lib/stepColors";

interface StepOpt { id: string; short: string; name: string; }
type SortKey = "name" | "mol_type" | "pathway_step" | "step_confidence" | "n_references" | "n_trials" | "n_omics";

const confColor: Record<string, string> = { high: "#15803d", medium: "#b45309", low: "#94a3b8" };
const confRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default function MoleculesExplorer({ molecules, steps }: { molecules: MoleculeSlim[]; steps: StepOpt[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [step, setStep] = useState("all");
  const [filter, setFilter] = useState<"all" | "druggable" | "genetic" | "trials">("all");
  const [sortKey, setSortKey] = useState<SortKey>("n_references");
  const [asc, setAsc] = useState(false);
  const [limit, setLimit] = useState(120);

  const stepShort: Record<string, string> = Object.fromEntries(steps.map((s) => [s.id, s.short]));

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const out = molecules.filter((m) => {
      if (step !== "all" && m.pathway_step !== step) return false;
      if (filter === "druggable" && !m.druggable) return false;
      if (filter === "genetic" && !m.has_genetic) return false;
      if (filter === "trials" && m.n_trials === 0) return false;
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
  }, [molecules, q, step, filter, sortKey, asc]);

  const shown = filtered.slice(0, limit);
  function toggleSort(k: SortKey) {
    if (k === sortKey) setAsc((v) => !v);
    else { setSortKey(k); setAsc(k === "name" || k === "mol_type"); }
    setLimit(120);
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)",
    borderRadius: 8, padding: "8px 11px", fontSize: 13.5, outline: "none",
  };
  const th = (k: SortKey, label: string, align: "left" | "right" = "left") => (
    <th onClick={() => toggleSort(k)}
        style={{ textAlign: align, padding: "9px 12px", cursor: "pointer", userSelect: "none",
                 color: sortKey === k ? "var(--text)" : "var(--muted)", fontWeight: 600, fontSize: 12,
                 borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0,
                 background: "var(--panel-2)" }}>
      {label}{sortKey === k ? (asc ? " ▲" : " ▼") : ""}
    </th>
  );
  const thPlain = (label: string, align: "left" | "center" | "right" = "left") => (
    <th style={{ textAlign: align, padding: "9px 12px", color: "var(--muted)", fontWeight: 600, fontSize: 12,
                 borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0,
                 background: "var(--panel-2)" }}>{label}</th>
  );

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <input
          placeholder="Search name, gene, mechanism…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setLimit(120); }}
          style={{ ...inputStyle, flex: "1 1 260px", minWidth: 200 }}
        />
        <select value={step} onChange={(e) => { setStep(e.target.value); setLimit(120); }} style={inputStyle}>
          <option value="all">All steps</option>
          {steps.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filter} onChange={(e) => { setFilter(e.target.value as typeof filter); setLimit(120); }} style={inputStyle}>
          <option value="all">Any evidence</option>
          <option value="druggable">Druggable only</option>
          <option value="genetic">Genetic evidence</option>
          <option value="trials">In clinical trials</option>
        </select>
        <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: "auto" }}>{filtered.length.toLocaleString()} molecules</span>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--panel)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
        <div style={{ maxHeight: "72vh", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {th("name", "Molecule")}
                {th("mol_type", "Type")}
                {th("pathway_step", "Pathway step")}
                {th("step_confidence", "Conf.")}
                {th("n_references", "Refs", "right")}
                {th("n_trials", "Trials", "right")}
                {th("n_omics", "Omics", "right")}
                {thPlain("Evidence", "left")}
                {thPlain("Mechanism", "left")}
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => {
                const sc = STEP_COLOR[m.pathway_step] ?? "#5b6b80";
                return (
                  <tr key={m.mol_id}
                      onClick={() => router.push(`/molecule/${m.mol_id}`)}
                      style={{ cursor: "pointer", borderBottom: "1px solid var(--hairline)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--row-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "9px 12px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 650 }}>{m.name}</div>
                      {m.gene_symbol && (
                        <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--muted)", fontSize: 11.5 }}>{m.gene_symbol}</div>
                      )}
                    </td>
                    <td style={{ padding: "9px 12px", color: "var(--muted)", verticalAlign: "top" }}>{m.mol_type}</td>
                    <td style={{ padding: "9px 12px", verticalAlign: "top" }}>
                      <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 20, fontSize: 11,
                                     background: sc + "1f", color: sc, border: `1px solid ${sc}3a` }}>
                        {stepShort[m.pathway_step] ?? m.pathway_step}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", verticalAlign: "top" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--muted)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 7, background: confColor[m.step_confidence] ?? "#94a3b8" }} />
                        {m.step_confidence}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", verticalAlign: "top", fontVariantNumeric: "tabular-nums" }}>{m.n_references || "—"}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", verticalAlign: "top", fontVariantNumeric: "tabular-nums", color: m.n_trials ? "var(--text)" : "var(--muted)" }}>{m.n_trials || "—"}</td>
                    <td style={{ padding: "9px 12px", textAlign: "right", verticalAlign: "top", fontVariantNumeric: "tabular-nums", color: m.n_omics ? "var(--text)" : "var(--muted)" }}>{m.n_omics || "—"}</td>
                    <td style={{ padding: "9px 12px", whiteSpace: "nowrap", verticalAlign: "top" }}>
                      {m.has_genetic && <span title="Genetic evidence" style={{ color: "#15803d" }}>✦</span>}
                      {m.druggable && <span title="Druggable" style={{ color: "#be185d", marginLeft: 6 }}>◆</span>}
                      {!m.has_genetic && !m.druggable && <span style={{ color: "var(--muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "9px 12px", color: "var(--muted)", fontSize: 12, lineHeight: 1.35, maxWidth: 340, verticalAlign: "top" }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {m.mechanism || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > limit && (
        <button
          onClick={() => setLimit((l) => l + 200)}
          style={{ ...inputStyle, marginTop: 18, cursor: "pointer", fontWeight: 600, width: "100%" }}
        >
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
      {filtered.length === 0 && <div style={{ color: "var(--muted)", padding: 30, textAlign: "center" }}>No molecules match.</div>}
    </>
  );
}
