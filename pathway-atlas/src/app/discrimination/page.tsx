import Header from "@/components/Header";
import DiscriminationTable from "@/components/DiscriminationTable";
import { getDiscrimination, getDiscriminationMeta } from "@/lib/data";

export const metadata = { title: "T1 vs T2 Discrimination" };

export default function DiscriminationPage() {
  const rows = getDiscrimination();
  const meta = getDiscriminationMeta() as {
    with_direct_evidence?: number; tier1_deep?: number;
    with_C_evidence?: number; with_R_evidence?: number; total_molecules?: number;
  };
  const direct = rows.filter((r) => r.D_score !== null)
    .sort((a, b) => (b.D_score ?? 0) - (a.D_score ?? 0));

  const stat = (label: string, value: React.ReactNode, sub?: string) => (
    <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      <Header subtitle="Type I vs Type II discrimination" />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Type I vs Type II MI discrimination</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 900, lineHeight: 1.6, marginBottom: 18 }}>
          Every molecule scored on five evidence-anchored axes and a composite <b>Type-I Discrimination Index (T1DI)</b>.
          All non-null scores trace to PubMed references; absence of evidence is shown as <span style={{ color: "#4b5563" }}>—</span>,
          never as zero. <b>Sort by any column.</b> Click a row for the molecule&apos;s full evidence page.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          {stat("molecules scored", (meta.total_molecules ?? rows.length).toLocaleString())}
          {stat("deep-scored (Tier 1)", meta.tier1_deep ?? "—", "full abstract extraction")}
          {stat("with rupture (R) evidence", meta.with_R_evidence ?? "—")}
          {stat("with confounder (C) evidence", meta.with_C_evidence ?? "—")}
          {stat("direct T1-vs-T2 studies", meta.with_direct_evidence ?? direct.length, "head-to-head")}
        </div>

        <section style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>The {direct.length} markers with direct head-to-head evidence</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
            The strongest tier — studies that directly compare the marker between Type-I and Type-II MI patients.
            Green = higher in Type I; orange = higher in Type II.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {direct.map((r) => {
              const t1 = (r.D_score ?? 0) > 0;
              const col = t1 ? "#43d17a" : "#f2854e";
              return (
                <a key={r.mol_id} href={`/molecule/${r.mol_id}`}
                   style={{ display: "block", background: "var(--panel)", border: `1px solid ${col}44`, borderRadius: 12, padding: "12px 14px", textDecoration: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{r.name}</span>
                    <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>{t1 ? "↑ Type I" : "↑ Type II"}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 5, lineHeight: 1.4 }}>{r.D_finding}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                    T1DI {r.T1DI ?? "—"} · {r.n_pmids} refs · {r.disc_class}
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>All molecules — sortable scores</h2>
        <DiscriminationTable rows={rows} />
      </main>
    </>
  );
}
