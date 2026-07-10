import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import { getMolecules, getPathway } from "@/lib/data";

export default function TablePage() {
  const molecules = getMolecules();
  const steps = getPathway().steps.sort((a, b) => a.order - b.order).map((s) => ({ id: s.step_id, short: s.short }));
  return (
    <>
      <Header subtitle={`Sortable table · ${molecules.length} molecules`} />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Data table</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 18 }}>
          All {molecules.length.toLocaleString()} molecules. Click a column header to sort; click a row for its evidence page.
          ◆ = druggable, ✦ = genetic evidence.
        </p>
        <DataTable molecules={molecules} steps={steps} />
      </main>
    </>
  );
}
