import type { Meta } from "@/lib/types";

// Six-metric strip under the hero (mono numbers), values from meta.json.
export default function StatStrip({ meta }: { meta: Meta }) {
  const stats: { n: number; label: string }[] = [
    { n: meta.n_molecules, label: "molecules cataloged" },
    { n: meta.n_steps, label: "cascade steps" },
    { n: (meta.harvest_sources?.pubmed_abstracts_mined as number) ?? 0, label: "abstracts mined" },
    { n: (meta.harvest_sources?.clinical_trials as number) ?? 0, label: "trials scanned" },
    { n: (meta.evidence_totals?.molecules_with_genetics as number) ?? 0, label: "with genetics" },
    { n: (meta.evidence_totals?.molecules_druggable as number) ?? 0, label: "druggable" },
  ];
  return (
    <div style={{ borderBottom: "1px solid var(--border)", background: "var(--panel)" }}>
      <div
        className="container-x"
        style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-mono" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              {s.n ? s.n.toLocaleString() : "—"}
            </div>
            <div className="mono-kicker" style={{ marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
