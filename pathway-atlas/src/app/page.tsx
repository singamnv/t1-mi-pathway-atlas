import Header from "@/components/Header";
import Hero from "@/components/home/Hero";
import StatStrip from "@/components/home/StatStrip";
import Chapter from "@/components/home/Chapter";
import CascadeExplorer, { type CascadeStep } from "@/components/home/CascadeExplorer";
import StepMoleculeTable from "@/components/StepMoleculeTable";
import { DashboardTeaser, DiscriminationTeaser, DiagnosticTeaser, MoleculesTeaser, MethodsSection } from "@/components/home/Teasers";
import { getPathway, getMeta, moleculesByStep, getDiscrimination, getDxUtility, getMolecules } from "@/lib/data";
import { stepColor } from "@/lib/stepColors";
import type { StepId } from "@/lib/types";

export default function Home() {
  const pathway = getPathway();
  const meta = getMeta();
  const byStep = moleculesByStep();
  const cascadeSteps = pathway.steps.filter((s) => s.step_id !== "s0_systemic").sort((a, b) => a.order - b.order);

  const cascade: CascadeStep[] = cascadeSteps.map((s) => ({
    id: s.step_id,
    short: s.short,
    name: s.name,
    count: s.n_molecules,
    desc: s.description,
    anchors: (s.anchors ?? []).join(" · "),
    color: stepColor(s.step_id),
  }));

  const bars = cascade.map((c) => ({ short: c.short, count: c.count, color: c.color }));

  // teaser data (small, precomputed slices)
  const discTop = getDiscrimination()
    .filter((d) => d.T1DI != null)
    .sort((a, b) => (b.T1DI ?? -1) - (a.T1DI ?? -1))
    .slice(0, 6);
  const dxTop = getDxUtility().slice().sort((a, b) => b.dc - a.dc).slice(0, 6);
  const chips = getMolecules().slice()
    .sort((a, b) => b.n_references - a.n_references)
    .slice(0, 8)
    .map((m) => ({ name: m.name, gene: m.gene_symbol, step: m.pathway_step }));

  return (
    <>
      <Header />
      <Hero nMolecules={meta.n_molecules} />
      <StatStrip meta={meta} />

      <main className="container-x" style={{ padding: "4px 24px 88px" }}>
        {/* 01 · PATHWAY */}
        <Chapter
          id="cascade"
          num="01"
          kicker="Pathway"
          title="The atherothrombotic cascade"
          subtitle="Eight ordered steps from lipid entry to myocardial injury. Tap a step — or let it auto-advance — to see what accumulates there."
        >
          <CascadeExplorer steps={cascade} />

          <div style={{ marginTop: 40 }}>
            <div className="mono-kicker">the cascade, molecule by molecule</div>
            <p style={{ margin: "6px 0 4px", color: "var(--muted)", fontSize: 14, lineHeight: 1.5, maxWidth: 720 }}>
              Every molecule in each step — refs, trials, mechanism and a confidence dot per row.
              <span className="font-mono" style={{ marginLeft: 8, fontSize: 12 }}>
                <span style={{ color: "#be185d" }}>◆</span> druggable · <span style={{ color: "#15803d" }}>✦</span> genetic
              </span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 22, marginTop: 18 }}>
              {cascadeSteps.map((step, i) => {
                const c = stepColor(step.step_id);
                return (
                  <div key={step.step_id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                      <span
                        className="font-display"
                        style={{ width: 26, height: 26, borderRadius: 8, background: c, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flex: "0 0 auto" }}
                      >
                        {i + 1}
                      </span>
                      <h3 className="font-display" style={{ fontSize: 16.5, fontWeight: 600, color: "var(--text)" }}>{step.name}</h3>
                      <span className="mono-kicker" style={{ marginLeft: 2 }}>{step.short}</span>
                      <span className="font-mono" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: c }}>{step.n_molecules}</span>
                    </div>
                    <StepMoleculeTable molecules={byStep[step.step_id as StepId] ?? []} />
                  </div>
                );
              })}
            </div>
          </div>
        </Chapter>

        {/* 02 · DASHBOARD */}
        <Chapter num="02" kicker="Dashboard" title="The whole atlas, at a glance"
          subtitle="Step distribution, evidence coverage, molecule type & placement confidence — click into any slice.">
          <DashboardTeaser bars={bars} />
        </Chapter>

        {/* 03 · T1 vs T2 */}
        <Chapter num="03" kicker="T1 vs T2" title="Which markers actually separate the two"
          subtitle="Type 1-vs-Type 2 discrimination scored on four axes — rupture (R), coronary (C), analytic (A) and evidence (E) — into a single T1 discrimination index.">
          <DiscriminationTeaser rows={discTop} />
        </Chapter>

        {/* 04 · DIAGNOSTIC */}
        <Chapter num="04" kicker="Diagnostic" title="Ranked by diagnostic utility"
          subtitle="Weight the axes to your question and the whole catalog re-ranks live — the markers most worth measuring float to the top.">
          <DiagnosticTeaser rows={dxTop} />
        </Chapter>

        {/* 05 · CATALOG */}
        <Chapter num="05" kicker="Catalog" title="Search all 1,969 molecules"
          subtitle="Filter by cascade step, molecule type and evidence; click any molecule for its full evidence page.">
          <MoleculesTeaser n={meta.n_molecules} chips={chips} />
        </Chapter>

        {/* 06 · METHODS */}
        <Chapter num="06" kicker="Methods" title="How it was built"
          subtitle="A reproducible, ground-up pipeline — from literature harvest to confident pathway placement.">
          <MethodsSection />
        </Chapter>
      </main>
    </>
  );
}
