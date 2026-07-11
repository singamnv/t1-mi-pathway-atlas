import Link from "next/link";
import type { MoleculeSlim } from "@/lib/types";

// Compact, dense table of a pathway step's molecules — far more scannable than a
// card grid. Shows every molecule in the step inside a capped-height scroll box,
// so the whole cascade stays on one page while all molecules remain reachable.
const confColor: Record<string, string> = { high: "#15803d", medium: "#b45309", low: "#94a3b8" };

export default function StepMoleculeTable({ molecules }: { molecules: MoleculeSlim[] }) {
  const th: React.CSSProperties = {
    textAlign: "left", padding: "7px 10px", fontSize: 11, fontWeight: 600, color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap",
    position: "sticky", top: 0, background: "var(--panel-2)", borderBottom: "1px solid var(--border)", zIndex: 1,
  };
  const thR: React.CSSProperties = { ...th, textAlign: "right" };
  const td: React.CSSProperties = { padding: "6px 10px", borderBottom: "1px solid var(--hairline)", verticalAlign: "top" };
  const tdR: React.CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--panel)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
      <div style={{ maxHeight: 380, overflowY: "auto", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>Molecule</th>
              <th style={th}>Type</th>
              <th style={th}>Conf.</th>
              <th style={thR}>Refs</th>
              <th style={thR}>Trials</th>
              <th style={{ ...th, textAlign: "center" }}>Evidence</th>
              <th style={th}>Mechanism</th>
            </tr>
          </thead>
          <tbody>
            {molecules.map((m) => (
              <tr key={m.mol_id} style={{ transition: "background .1s" }}>
                <td style={td}>
                  <Link href={`/molecule/${m.mol_id}`} style={{ fontWeight: 650, color: "var(--text)" }}>
                    {m.name}
                  </Link>
                  {m.gene_symbol && (
                    <span style={{ marginLeft: 7, fontFamily: "ui-monospace, monospace", color: "var(--muted)", fontSize: 11.5 }}>{m.gene_symbol}</span>
                  )}
                </td>
                <td style={{ ...td, color: "var(--muted)", whiteSpace: "nowrap" }}>{m.mol_type}</td>
                <td style={td}>
                  <span title={`${m.step_confidence} confidence`} style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, background: confColor[m.step_confidence] ?? "#94a3b8" }} />
                </td>
                <td style={tdR}>{m.n_references || "—"}</td>
                <td style={{ ...tdR, color: m.n_trials ? "var(--text)" : "var(--muted)" }}>{m.n_trials || "—"}</td>
                <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>
                  {m.has_genetic && <span title="Genetic evidence" style={{ color: "#15803d" }}>✦</span>}
                  {m.druggable && <span title="Druggable" style={{ color: "#be185d", marginLeft: 5 }}>◆</span>}
                  {!m.has_genetic && !m.druggable && <span style={{ color: "var(--muted)" }}>—</span>}
                </td>
                <td style={{ ...td, color: "var(--muted)", fontSize: 12, lineHeight: 1.3, maxWidth: 360 }}>
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {m.mechanism || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
