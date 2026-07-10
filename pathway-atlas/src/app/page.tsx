import Link from "next/link";
import Header from "@/components/Header";
import MoleculeCard from "@/components/MoleculeCard";
import { getPathway, getMeta, moleculesByStep } from "@/lib/data";
import type { StepId } from "@/lib/types";

export default function Home() {
  const pathway = getPathway();
  const meta = getMeta();
  const byStep = moleculesByStep();
  const cascade = pathway.steps.filter((s) => s.step_id !== "s0_systemic").sort((a, b) => a.order - b.order);
  const systemic = pathway.steps.find((s) => s.step_id === "s0_systemic");

  const PREVIEW = 12;

  return (
    <>
      <Header />
      {/* Hero */}
      <section style={{ borderBottom: "1px solid var(--border)", background: "radial-gradient(1200px 400px at 20% -10%, #16202f, transparent)" }}>
        <div className="container-x" style={{ padding: "40px 24px 32px" }}>
          <div style={{ fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>
            De novo molecular atlas
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: "8px 0 6px", lineHeight: 1.1 }}>
            The Type&nbsp;1 Myocardial Infarction Pathway
          </h1>
          <p style={{ maxWidth: 760, color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>
            {pathway.description} Every molecule below was surfaced by an independent, ground-up harvest of the primary
            literature, omics repositories, clinical trials, and human genetics — then placed within the step of the
            atherothrombotic cascade where it acts, with its evidence linked.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 22, marginTop: 22 }}>
            <Stat n={meta.n_molecules} label="molecules cataloged" />
            <Stat n={meta.n_steps} label="cascade steps" />
            <Stat n={meta.harvest_sources.pubmed_abstracts_mined} label="abstracts mined" />
            <Stat n={meta.harvest_sources.clinical_trials} label="trials scanned" />
            <Stat n={meta.evidence_totals.molecules_with_genetics} label="with genetic evidence" />
            <Stat n={meta.evidence_totals.molecules_druggable} label="druggable targets" />
          </div>
        </div>
      </section>

      {/* Cascade */}
      <main className="container-x" style={{ padding: "28px 24px 60px" }}>
        {cascade.map((step, i) => {
          const mols = byStep[step.step_id as StepId] ?? [];
          const preview = mols.slice(0, PREVIEW);
          return (
            <section key={step.step_id} className={`step-${step.step_id}`} style={{ marginBottom: 34 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--c)", color: "#0a0e14", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, flex: "0 0 auto" }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 19, fontWeight: 750 }}>{step.name}</h2>
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{step.short}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2, maxWidth: 900, lineHeight: 1.4 }}>{step.description}</p>
                </div>
                <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--c)" }}>{step.n_molecules}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>molecules</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                {preview.map((m) => <MoleculeCard key={m.mol_id} m={m} />)}
              </div>
              {mols.length > PREVIEW && (
                <Link href={`/step/${step.step_id}`} style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "var(--c)", fontWeight: 600 }}>
                  View all {mols.length} molecules in {step.short} →
                </Link>
              )}
            </section>
          );
        })}

        {/* Systemic */}
        {systemic && (
          <section className="step-s0_systemic" style={{ marginTop: 20, paddingTop: 22, borderTop: "1px dashed var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontSize: 18, fontWeight: 750 }}>{systemic.name}</h2>
              <span style={{ fontSize: 20, fontWeight: 800, color: "var(--c)", marginLeft: "auto" }}>{systemic.n_molecules}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", maxWidth: 900, lineHeight: 1.4, marginBottom: 10 }}>{systemic.description}</p>
            <Link href={`/step/s0_systemic`} style={{ fontSize: 13, color: "var(--c)", fontWeight: 600 }}>
              View all {systemic.n_molecules} systemic / off-pathway molecules →
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{n.toLocaleString()}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{label}</div>
    </div>
  );
}
