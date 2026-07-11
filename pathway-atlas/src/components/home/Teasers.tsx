import Link from "next/link";
import type { ReactNode } from "react";
import type { DiscRecord } from "@/lib/types";
import type { DxRecord } from "@/lib/data";
import { stepColor } from "@/lib/stepColors";

/* Shared elevated teaser card with a CTA footer link. */
function TeaserCard({ children, href, cta }: { children: ReactNode; href: string; cta: string }) {
  return (
    <div style={{ borderRadius: "var(--r-lg)", background: "var(--panel)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      <div style={{ padding: "18px 20px" }}>{children}</div>
      <Link
        href={href}
        className="font-mono"
        style={{ display: "block", padding: "11px 20px", borderTop: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--accent)", fontSize: 12.5, fontWeight: 600 }}
      >
        {cta} →
      </Link>
    </div>
  );
}

const cell: React.CSSProperties = { padding: "6px 8px", borderBottom: "1px solid var(--hairline)", fontSize: 12.5 };
const cellR: React.CSSProperties = { ...cell, textAlign: "right", fontVariantNumeric: "tabular-nums" };
const head: React.CSSProperties = { padding: "6px 8px", textAlign: "left", fontFamily: "var(--ff-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.6, color: "var(--muted-2)", borderBottom: "1px solid var(--border)" };

/* 02 · DASHBOARD — molecules per cascade step, horizontal bars. */
export function DashboardTeaser({ bars }: { bars: { short: string; count: number; color: string }[] }) {
  const max = Math.max(...bars.map((b) => b.count), 1);
  return (
    <TeaserCard href="/dashboard" cta="Open the dashboard — step distribution, evidence & type coverage">
      <div className="mono-kicker" style={{ marginBottom: 12 }}>molecules per cascade step</div>
      <div style={{ display: "grid", gap: 8 }}>
        {bars.map((b) => (
          <div key={b.short} style={{ display: "grid", gridTemplateColumns: "150px 1fr 42px", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.short}</span>
            <span style={{ height: 10, borderRadius: 100, background: "var(--track)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${(b.count / max) * 100}%`, background: `linear-gradient(90deg, ${b.color}, ${b.color}bb)`, borderRadius: 100 }} />
            </span>
            <span className="font-mono" style={{ fontSize: 12, textAlign: "right", color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{b.count}</span>
          </div>
        ))}
      </div>
    </TeaserCard>
  );
}

/* 03 · T1 vs T2 — R / C / A / E discrimination sub-scores. */
export function DiscriminationTeaser({ rows }: { rows: DiscRecord[] }) {
  const fmt = (v: number | null) => (v == null ? "—" : v.toFixed(2));
  return (
    <TeaserCard href="/discrimination" cta="Open the T1-vs-T2 table — sortable R / C / A / E sub-scores">
      <div className="mono-kicker" style={{ marginBottom: 10 }}>discrimination sub-scores · top markers</div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", minWidth: 380, borderCollapse: "collapse" }}>
          <thead>
            <tr><th style={head}>Marker</th><th style={{ ...head, textAlign: "right" }}>R</th><th style={{ ...head, textAlign: "right" }}>C</th><th style={{ ...head, textAlign: "right" }}>A</th><th style={{ ...head, textAlign: "right" }}>E</th><th style={{ ...head, textAlign: "right" }}>T1DI</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.mol_id}>
                <td style={{ ...cell, fontWeight: 600, color: "var(--text)" }}>
                  {r.name}{r.gene_symbol && <span className="font-mono" style={{ marginLeft: 6, fontSize: 10.5, color: "var(--muted-2)" }}>{r.gene_symbol}</span>}
                </td>
                <td style={cellR}>{fmt(r.R_score)}</td>
                <td style={cellR}>{fmt(r.C_score)}</td>
                <td style={cellR}>{fmt(r.A_score)}</td>
                <td style={cellR}>{fmt(r.E_score)}</td>
                <td style={{ ...cellR, fontWeight: 600, color: "var(--accent)" }}>{fmt(r.T1DI)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TeaserCard>
  );
}

/* 04 · DIAGNOSTIC — ranked diagnostic utility. */
export function DiagnosticTeaser({ rows }: { rows: DxRecord[] }) {
  return (
    <TeaserCard href="/diagnostic" cta="Open the diagnostic explorer — weight the axes, re-rank live">
      <div className="mono-kicker" style={{ marginBottom: 10 }}>diagnostic utility · ranked</div>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((r, i) => (
          <div key={r.mol_id} style={{ display: "grid", gridTemplateColumns: "22px 1fr 54px", alignItems: "center", gap: 10, padding: "3px 0", borderBottom: "1px solid var(--hairline)" }}>
            <span className="font-mono" style={{ fontSize: 12, color: "var(--muted-2)" }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: stepColor(r.step), flex: "0 0 auto" }} />
              {r.name}
            </span>
            <span className="font-mono" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{r.dc.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </TeaserCard>
  );
}

/* 06 · MOLECULES — search + sample chips. (05 · TABLE reuses this component shape.) */
export function MoleculesTeaser({ n, chips }: { n: number; chips: { name: string; gene: string | null; step: string }[] }) {
  return (
    <TeaserCard href="/molecules" cta="Browse all molecules — search & filter by step, type, evidence">
      <div
        className="font-mono"
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 100, background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13 }}
      >
        <span aria-hidden>⌕</span> Search {n.toLocaleString()} molecules by name or gene…
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
        {chips.map((c) => (
          <span key={c.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--panel)", border: "1px solid var(--border-2)", fontSize: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: stepColor(c.step) }} />
            <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{c.name}</span>
            {c.gene && <span className="font-mono" style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{c.gene}</span>}
          </span>
        ))}
      </div>
    </TeaserCard>
  );
}

/* 07 · METHODS — the seven-step build. */
const BUILD: { n: string; title: string; desc: string }[] = [
  { n: "01", title: "Harvest", desc: "Ground-up sweep of the primary literature — 2,645 abstracts mined." },
  { n: "02", title: "Place", desc: "Each molecule pinned to the cascade step where its role is strongest." },
  { n: "03", title: "Link", desc: "Omics datasets, clinical trials, genetics & druggability attached." },
  { n: "04", title: "Score", desc: "Type 1-vs-Type 2 discrimination sub-scores (R / C / A / E)." },
  { n: "05", title: "Confidence", desc: "A confidence grade on every step placement." },
];
export function MethodsSection() {
  return (
    <TeaserCard href="/about" cta="Read the full methods — from harvest to pathway placement">
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {BUILD.map((b) => (
          <div key={b.n}>
            <div className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{b.n}</div>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "3px 0 4px" }}>{b.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 }}>{b.desc}</div>
          </div>
        ))}
      </div>
    </TeaserCard>
  );
}
