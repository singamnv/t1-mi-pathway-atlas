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
        <details style={{ maxWidth: 920, marginBottom: 22, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
          <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--text)", listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--accent)" }}>ⓘ</span> Methodology — how the criteria and the ranking are built
          </summary>
          <div style={{ marginTop: 12, fontSize: 12.8, lineHeight: 1.68, color: "var(--text-2)" }}>
            <p style={{ margin: "0 0 12px" }}>
              This explorer scores each biomarker against <b>nine criteria</b>, each normalized to <b>0–100</b> (higher is
              better for a Type-I diagnostic), and combines them into a single composite using weights <i>you</i> set. The
              criteria fall into three groups. <b>Discrimination criteria</b> — <i>plaque-rupture signal</i> (R),{" "}
              <i>specificity vs demand</i> (the confounder score C, inverted), and <i>direct T1&nbsp;&gt;&nbsp;T2 evidence</i>{" "}
              (D) — come from the atlas&apos;s Type-I-vs-Type-II scoring and capture whether a marker reflects atherothrombosis
              rather than the supply–demand mismatch of a Type-II MI. <b>Direct diagnostic criteria</b> —{" "}
              <i>diagnostic performance</i> (sensitivity/specificity/AUC), <i>release kinetics</i> (how early it rises), and{" "}
              <i>incremental value vs troponin</i> — are extracted from index-test / accuracy studies in the literature;
              only ~14 markers have any of this data, and the rest correctly show <span style={{ color: "#4b5563" }}>—</span>{" "}
              rather than a fabricated value. <b>Practical criteria</b> — <i>assay feasibility</i>, <i>evidence strength</i>,
              and <i>novelty</i> — capture deployability and how under-explored a marker is (incumbents already in clinical
              use are capped low so they never register as novel).
            </p>
            <p style={{ margin: "0 0 12px" }}>
              <b>Composite.</b> The score is a weighted average of the available sub-scores. When{" "}
              <b>&ldquo;penalize missing data&rdquo;</b> is on, the average divides by the <i>total</i> weight you assigned, so
              a marker with unmeasured criteria is pulled down — this rewards markers that have actually been studied across
              the board. Turn it off to divide only by the weight of the criteria a marker <i>does</i> have, scoring each
              marker on its own evidence. Presets (rule-in, deployable-today, best diagnostic test, novel discovery) are just
              saved weight profiles; every weight remains adjustable.
            </p>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Hover (or tab to) any criterion label or table column header for its definition. Scores are evidence-anchored
              inferences for hypothesis prioritization, <b>not</b> a validated clinical instrument — see the{" "}
              <a href="/about" style={{ color: "var(--accent)", fontWeight: 600 }}>Methods</a> page for the full harvest and
              scoring provenance.
            </p>
          </div>
        </details>

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
