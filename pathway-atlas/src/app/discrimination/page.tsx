import Header from "@/components/Header";
import DiscriminationTable from "@/components/DiscriminationTable";
import { getDiscrimination, getDiscriminationMeta } from "@/lib/data";

export const metadata = { title: "Type I vs non-Type I MI Discrimination" };

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
      <Header subtitle="Type I vs non-Type I discrimination" />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Type I vs non-Type I MI discrimination</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 900, lineHeight: 1.6, marginBottom: 18 }}>
          Every molecule scored on five evidence-anchored axes and a composite <b>Type-I Discrimination Index (T1DI)</b>.
          The comparator is the full <b>Fourth Universal Definition non-Type-1 set</b> — Type&nbsp;2 (supply–demand
          mismatch), Type&nbsp;3 (sudden cardiac death), Type&nbsp;4a (PCI-related), Type&nbsp;4b (stent thrombosis),
          Type&nbsp;4c (in-stent restenosis) and Type&nbsp;5 (CABG-related) — so a marker scores well only if it tracks
          atherothrombosis and <i>not</i> the other ways myocardium infarcts.
          All non-null scores trace to PubMed references; absence of evidence is shown as <span style={{ color: "#4b5563" }}>—</span>,
          never as zero. <b>Sort by any column.</b> Click a row for the molecule&apos;s full evidence page.
        </p>

        <div role="note" style={{ display: "flex", gap: 10, alignItems: "flex-start", maxWidth: 900, marginBottom: 20, padding: "10px 14px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.35)", borderRadius: 10, fontSize: 12.5, color: "var(--text)", lineHeight: 1.55 }}>
          <span aria-hidden style={{ fontSize: 15 }}>⚠️</span>
          <span><b>Evidence is abstract-level.</b> Scores are mined from PubMed abstracts, so a cited study may be topically relevant to a marker without directly testing the Type-1-vs-non-Type-1 comparison stated. Coverage is also uneven across the comparator: the demand-mismatch (Type&nbsp;2) and procedural (Type&nbsp;4a/5) axes are far better studied than sudden death (Type&nbsp;3) or restenosis (Type&nbsp;4c). Treat this as a hypothesis-generating map, not adjudicated diagnostic evidence.</span>
        </div>

        <div style={{ maxWidth: 900, marginBottom: 20, padding: "12px 16px", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, fontSize: 13, lineHeight: 1.6 }}>
          <b>The headline result of the broadened comparator: no molecule in this catalog is
          Type-I-specific.</b> Against Type&nbsp;2 alone, one marker cleared the bar. Against the full non-Type-I
          set, <b>zero</b> do — the lowest non-Type-I responsiveness among markers with a real rupture signal is
          C&nbsp;=&nbsp;33, well above the specificity threshold. The markers that rank highest by composite
          (troponin&nbsp;T, CK-MB, troponin&nbsp;I) do so on evidence strength and assay feasibility while remaining{" "}
          <i>Shared</i> — they rise after PCI and CABG too. Read this page as a map of how far the field is from a
          rule-in marker, not as a shortlist of ones that work.
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          {stat("molecules scored", (meta.total_molecules ?? rows.length).toLocaleString())}
          {stat("deep-scored (Tier 1)", meta.tier1_deep ?? "—", "full abstract extraction")}
          {stat("with rupture (R) evidence", meta.with_R_evidence ?? "—")}
          {stat("with non-T1 (C) evidence", meta.with_C_evidence ?? "—")}
          {stat("direct T1-vs-non-T1 studies", meta.with_direct_evidence ?? direct.length, "head-to-head")}
        </div>

        <section style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>The {direct.length} markers with direct head-to-head evidence</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
            The strongest tier — studies that directly compare the marker between Type-I MI patients and a non-Type-I
            comparator group. Green = higher in Type I; orange = higher in the non-Type-I group.
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
                    <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>{t1 ? "↑ Type I" : "↑ non-Type I"}</span>
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
