import type { MoleculeSlim } from "@/lib/types";

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 10.5, fontWeight: 600, padding: "1px 6px", borderRadius: 6,
        background: color + "22", color, border: `1px solid ${color}44`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export default function EvidenceBadges({ m }: { m: MoleculeSlim }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {m.n_references > 0 && <Badge text={`${m.n_references} refs`} color="#4cc9f0" />}
      {m.n_trials > 0 && <Badge text={`${m.n_trials} trials`} color="#f2c14e" />}
      {m.n_omics > 0 && <Badge text={`${m.n_omics} omics`} color="#b388eb" />}
      {m.has_genetic && <Badge text="genetic" color="#43d17a" />}
      {m.druggable && <Badge text="druggable" color="#ff8fa3" />}
    </div>
  );
}
