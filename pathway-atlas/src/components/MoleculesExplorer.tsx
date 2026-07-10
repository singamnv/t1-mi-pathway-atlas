"use client";
import { useMemo, useState } from "react";
import type { MoleculeSlim } from "@/lib/types";
import MoleculeCard from "./MoleculeCard";

interface StepOpt { id: string; short: string; name: string; }

export default function MoleculesExplorer({ molecules, steps }: { molecules: MoleculeSlim[]; steps: StepOpt[] }) {
  const [q, setQ] = useState("");
  const [step, setStep] = useState("all");
  const [filter, setFilter] = useState<"all" | "druggable" | "genetic" | "trials">("all");
  const [limit, setLimit] = useState(120);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return molecules.filter((m) => {
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
  }, [molecules, q, step, filter]);

  const shown = filtered.slice(0, limit);

  const inputStyle: React.CSSProperties = {
    background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)",
    borderRadius: 8, padding: "8px 11px", fontSize: 13.5, outline: "none",
  };

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
        {shown.map((m) => <MoleculeCard key={m.mol_id} m={m} />)}
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
