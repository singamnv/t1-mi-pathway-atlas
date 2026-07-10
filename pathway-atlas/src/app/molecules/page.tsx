import Header from "@/components/Header";
import MoleculesExplorer from "@/components/MoleculesExplorer";
import { getMolecules, getPathway } from "@/lib/data";

export default function MoleculesPage() {
  const molecules = getMolecules();
  const steps = getPathway().steps.sort((a, b) => a.order - b.order).map((s) => ({ id: s.step_id, short: s.short, name: s.name }));
  return (
    <>
      <Header subtitle={`All ${molecules.length} molecules`} />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>All molecules</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 18 }}>
          Search and filter the full de novo catalog. Click any molecule for its evidence page.
        </p>
        <MoleculesExplorer molecules={molecules} steps={steps} />
      </main>
    </>
  );
}
