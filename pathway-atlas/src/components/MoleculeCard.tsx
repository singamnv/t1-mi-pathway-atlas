import Link from "next/link";
import type { MoleculeSlim } from "@/lib/types";
import EvidenceBadges from "./EvidenceBadges";

const confColor: Record<string, string> = {
  high: "#43d17a", medium: "#f2c14e", low: "#8b98a9",
};

export default function MoleculeCard({ m }: { m: MoleculeSlim }) {
  return (
    <Link
      href={`/molecule/${m.mol_id}`}
      className={`step-${m.pathway_step}`}
      style={{
        display: "block", padding: "10px 12px", borderRadius: 10,
        background: "var(--panel-2)", border: "1px solid var(--border)",
        borderLeft: "3px solid var(--c)", transition: "background .12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontWeight: 650, fontSize: 14 }}>{m.name}</span>
        {m.gene_symbol && (
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "ui-monospace, monospace" }}>
            {m.gene_symbol}
          </span>
        )}
        <span
          title={`${m.step_confidence} confidence`}
          style={{
            marginLeft: "auto", width: 8, height: 8, borderRadius: 8,
            background: confColor[m.step_confidence] ?? "#8b98a9", flex: "0 0 auto",
          }}
        />
      </div>
      {m.mechanism && (
        <div style={{ fontSize: 11.5, color: "var(--muted)", margin: "5px 0 7px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {m.mechanism}
        </div>
      )}
      <EvidenceBadges m={m} />
    </Link>
  );
}
