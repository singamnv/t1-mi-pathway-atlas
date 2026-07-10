import Header from "@/components/Header";
import DxUtility from "@/components/DxUtility";
import { getDxUtility } from "@/lib/data";

export const metadata = { title: "Type-I MI Diagnostic Utility" };

export default function DiagnosticPage() {
  const rows = getDxUtility();
  return (
    <>
      <Header subtitle="Type-I MI diagnostic utility" />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Type-I MI diagnostic-utility explorer</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 920, lineHeight: 1.6, marginBottom: 20 }}>
          Rank every biomarker for its usefulness in diagnosing <b>Type-I (atherothrombotic) MI</b>. Each marker carries six
          evidence-anchored sub-scores; <b>you decide how much each one matters</b> using the sliders. The composite and the
          ranking recompute instantly. Start from a preset (rule-in, deployable-today, novel discovery) or set your own weights.
          Scores with no evidence show <span style={{ color: "#4b5563" }}>—</span> and are never invented.
        </p>
        <p style={{ color: "var(--muted)", fontSize: 12.5, maxWidth: 920, lineHeight: 1.55, marginBottom: 20, padding: "10px 14px", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <b style={{ color: "var(--text)" }}>Three axes are directly diagnostic</b> — <span style={{ color: "#ff6b9d" }}>Diagnostic performance</span> (sensitivity/specificity/AUC), <span style={{ color: "#c77dff" }}>Release kinetics</span> (how early it rises), and <span style={{ color: "#ffd166" }}>Incremental value vs troponin</span> — extracted from accuracy studies. Only ~14 markers have any of this data (procalcitonin, troponin T, Cardiac troponin T/I, myoglobin, CK-MB, cMyBP-C for kinetics; MR-proADM, ApoJ-Glyc, IMA, cystatin C for accuracy; GDF-15, ST2, BNP, myoglobin, troponin T, MR-proADM, CK-MB, Creatine kinase-MB, cMyBP-C for incremental value); for everything else these show <span style={{ color: "#4b5563" }}>—</span>. That sparsity is itself the finding: <b style={{ color: "var(--text)" }}>very few candidates have been studied as an MI index test the way troponin has.</b>
        </p>
        <DxUtility rows={rows} />
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 20, maxWidth: 920, lineHeight: 1.55 }}>
          <b>How the composite works:</b> each sub-score is 0–100 (higher = better for a Type-I diagnostic). The composite is a
          weighted average of the sub-scores using your slider weights. &ldquo;Penalize missing data&rdquo; divides by the total weight
          rather than only the covered weight, so markers with gaps rank lower — turn it off to score markers on the evidence they
          do have. This is a hypothesis-prioritization tool, not a validated clinical instrument.
        </p>
      </main>
    </>
  );
}
