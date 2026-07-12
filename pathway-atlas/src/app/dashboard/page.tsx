import Link from "next/link";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import CrossFilter from "@/components/CrossFilter";
import { getStats, getDashboardAnalytics, getCrossfilter } from "@/lib/data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export default function DashboardPage() {
  const stats = getStats();
  const analytics = getDashboardAnalytics() as Any;
  const cf = getCrossfilter() as Any;
  return (
    <>
      <Header subtitle="Interactive dashboard" />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
          <Link href="/table" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginLeft: "auto" }}>
            Open sortable data table →
          </Link>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 18 }}>
          Interactive views over the {stats.n_molecules.toLocaleString()}-molecule catalog. Charts are hoverable; the step
          chart is clickable. Each panel has a <b>“How to read this”</b> toggle with what it shows, how to read it, and the takeaway.
        </p>
        <p style={{ color: "var(--muted)", fontSize: 12, maxWidth: 900, lineHeight: 1.55, marginBottom: 18, padding: "10px 14px", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <b style={{ color: "var(--text)" }}>Reading the confidence & step buckets.</b>{" "}
          {(stats.by_confidence?.low ?? 0).toLocaleString()} of {stats.n_molecules.toLocaleString()} molecules
          ({Math.round(100 * (stats.by_confidence?.low ?? 0) / stats.n_molecules)}%) carry a <b>low</b> pathway-step
          confidence — treat their placement as tentative. The <b>“systemic / off-pathway”</b> step
          ({(stats.steps?.find((s: Any) => s.step_id === "s0_systemic")?.n ?? 0).toLocaleString()} molecules) is a deliberate
          catch-all for circulating markers of MI risk or injury that do not sit at a specific point in the atherothrombotic
          cascade (e.g. systemic metabolic markers); it is not one of the eight ordered cascade steps.
        </p>
        <Dashboard stats={stats} />

        <div style={{ margin: "34px 0 16px", borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Discrimination & diagnostic analytics</h2>
          <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 900, lineHeight: 1.55 }}>
            Deeper views over the Type-I-vs-Type-II scoring, assay logistics, and evidence coverage. The signature map and
            leaderboard are clickable; every chart is hoverable.
          </p>
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 3 }}>Linked cross-filter explorer</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Click any bar to filter <b>every</b> panel at once — e.g. pick a pathway step, then see the class / type / evidence
            breakdown for just those molecules, with the matching set listed below. Stack filters; each chip removes one.
          </div>
          <CrossFilter mols={cf.mols} stepShort={cf.step_short} />
        </div>

        <DashboardAnalytics a={analytics} />
      </main>
    </>
  );
}
