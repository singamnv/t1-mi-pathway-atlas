import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MoleculeCard from "@/components/MoleculeCard";
import { getPathway, moleculesByStep } from "@/lib/data";
import type { StepId } from "@/lib/types";

export function generateStaticParams() {
  return getPathway().steps.map((s) => ({ stepId: s.step_id }));
}

export default async function StepPage({ params }: { params: Promise<{ stepId: string }> }) {
  const { stepId } = await params;
  const pathway = getPathway();
  const step = pathway.steps.find((s) => s.step_id === stepId);
  if (!step) notFound();
  const mols = moleculesByStep()[stepId as StepId] ?? [];

  return (
    <>
      <Header subtitle={step.name} />
      <main className="container-x" style={{ padding: "26px 24px 60px" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--muted)" }}>← Full pathway</Link>
        <div className={`step-${step.step_id}`} style={{ margin: "12px 0 20px", paddingLeft: 14, borderLeft: "4px solid var(--c)" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>{step.name}</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4, maxWidth: 900, lineHeight: 1.5 }}>{step.description}</p>
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
            <b style={{ color: "var(--c)" }}>{mols.length}</b> molecules ·{" "}
            {step.n_druggable} druggable · {step.n_with_trials} with clinical trials
          </div>
          {step.anchors?.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
              Canonical markers: {step.anchors.join(", ")}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
          {mols.map((m) => <MoleculeCard key={m.mol_id} m={m} />)}
        </div>
      </main>
    </>
  );
}
