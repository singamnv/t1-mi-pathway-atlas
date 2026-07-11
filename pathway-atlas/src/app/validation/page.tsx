import Header from "@/components/Header";
import fs from "node:fs";
import path from "node:path";

export const metadata = { title: "External Validation — Cardiovascular ICU Snapshot" };

type Disc = {
  marker: string; t1_median: number; t2_median: number; unit: string;
  higher_in: string; p: number; auc: number; n: number;
};
type Cov = { analyte: string; pct: number };
type Validation = {
  cohort: {
    source: string; n_admissions_total: number; n_waves: number;
    mi_total: number; mi_type1_acs: number; mi_type2: number; note: string;
  };
  coverage: Cov[];
  discriminators: Disc[];
  not_collected: string[];
  atlas_overlap: string;
  conclusion: string;
};

function getValidation(): Validation {
  const p = path.join(process.cwd(), "public", "data", "validation_registry.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Validation;
}

export default function ValidationPage() {
  const v = getValidation();

  const stat = (label: string, value: React.ReactNode, sub?: string) => (
    <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{sub}</div>}
    </div>
  );

  const strong = (d: Disc) => d.auc >= 0.65;

  return (
    <>
      <Header subtitle="External validation · cardiovascular ICU snapshot" />
      <main className="container-x" style={{ padding: "24px 24px 60px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>External validation in a cardiovascular ICU snapshot</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 920, lineHeight: 1.6, marginBottom: 18 }}>
          The atlas is built from literature-mined, molecule-level evidence. This page tests one of its central
          predictions — that a <b>demand / hypoperfusion axis</b> separates <b>Type&nbsp;2 (demand-related) MI</b> from
          <b> Type&nbsp;1 (atherothrombotic) MI</b> — against real patients in an independent, de-identified
          <b> single-center medical cardiovascular ICU snapshot spanning 7 years</b>. It is an{" "}
          <b>out-of-sample reality check on the feature prior</b>, not a deployable classifier.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          {stat("CICU admissions", v.cohort.n_admissions_total.toLocaleString(), `over ${v.cohort.n_waves} years`)}
          {stat("MI admissions", v.cohort.mi_total, "pooled primary + secondary dx")}
          {stat("Type 1 / ACS", v.cohort.mi_type1_acs)}
          {stat("Type 2 (demand)", v.cohort.mi_type2)}
          {stat("with numeric troponin", "17", "the coverage ceiling")}
        </div>

        {/* Finding banner */}
        <div style={{ background: "rgba(209,73,91,0.07)", border: "1px solid rgba(209,73,91,0.30)", borderRadius: 12, padding: "14px 18px", maxWidth: 920, marginBottom: 26 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>What the snapshot confirms</div>
          <p style={{ fontSize: 12.8, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
            Type&nbsp;2 MI carries a <b>multiorgan demand-stress fingerprint</b> — higher <b>lactate</b> (AUC 0.80) and
            <b> creatinine</b> (AUC 0.69) — consistent with supply–demand mismatch from sepsis, hypoxia, or shock. This
            echoes the atlas&apos;s two-axis design. It does <b>not</b> mean Type&nbsp;1 is separable by plaque-rupture
            markers here: troponin and CK-MB — the atlas&apos;s top two markers — are the exact analytes this ICU snapshot
            barely captures (troponin, 8%) or never measures (CK-MB).
          </p>
        </div>

        {/* Section 1: diagnosis availability */}
        <section style={{ marginBottom: 30, maxWidth: 920 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>1 · How MI is coded</h2>
          <p style={{ fontSize: 12.8, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{v.cohort.note}</p>
        </section>

        {/* Section 2: coverage figure */}
        <section style={{ marginBottom: 30, maxWidth: 920 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>2 · What is actually measured</h2>
          <p style={{ fontSize: 12.8, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
            This is a critical-care ICU snapshot, not a chest-pain workup: labs are recorded for ICU severity scoring, not to
            work up the index MI. Cardiac-specific markers are the sparsest. Not collected at all:{" "}
            <b>{v.not_collected.join(", ")}</b>.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figures/validation_coverage.png" alt="Numeric coverage of MI-relevant analytes across the 224 MI patients"
               style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--panel-2)" }} />
        </section>

        {/* Section 3: discrimination table + figure */}
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>3 · Which markers separate Type 2 from Type 1</h2>
          <p style={{ fontSize: 12.8, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12, maxWidth: 920 }}>
            Mann–Whitney tests on every analyte with usable coverage. AUC is on the measured subset (n varies). Rows in{" "}
            <span style={{ color: "#d1495b", fontWeight: 600 }}>red</span> are the two markers that meaningfully
            discriminate.
          </p>
          <div style={{ overflowX: "auto", maxWidth: 920, marginBottom: 16 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "7px 10px" }}>Marker</th>
                  <th style={{ padding: "7px 10px" }}>Type 1 median</th>
                  <th style={{ padding: "7px 10px" }}>Type 2 median</th>
                  <th style={{ padding: "7px 10px" }}>Higher in</th>
                  <th style={{ padding: "7px 10px" }}>p</th>
                  <th style={{ padding: "7px 10px" }}>AUC</th>
                  <th style={{ padding: "7px 10px" }}>n</th>
                </tr>
              </thead>
              <tbody>
                {v.discriminators.map((d) => (
                  <tr key={d.marker} style={{ borderBottom: "1px solid var(--border)", color: strong(d) ? "#d1495b" : "var(--text-2)", fontWeight: strong(d) ? 600 : 400 }}>
                    <td style={{ padding: "7px 10px" }}>{d.marker}</td>
                    <td style={{ padding: "7px 10px" }}>{d.t1_median} {d.unit}</td>
                    <td style={{ padding: "7px 10px" }}>{d.t2_median} {d.unit}</td>
                    <td style={{ padding: "7px 10px" }}>{d.higher_in}</td>
                    <td style={{ padding: "7px 10px" }}>{d.p < 0.001 ? "<0.001" : d.p.toFixed(3)}</td>
                    <td style={{ padding: "7px 10px" }}>{d.auc.toFixed(2)}</td>
                    <td style={{ padding: "7px 10px" }}>{d.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figures/validation_discrimination.png" alt="Single-marker AUC for Type 2 vs Type 1 MI"
               style={{ width: "100%", maxWidth: 920, borderRadius: 12, border: "1px solid var(--border)", background: "var(--panel-2)" }} />
        </section>

        {/* Section 4: overlap + limits */}
        <section style={{ marginBottom: 26, maxWidth: 920 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>4 · Relation to the atlas catalog</h2>
          <p style={{ fontSize: 12.8, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 12px" }}>{v.atlas_overlap}</p>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>5 · What this can and cannot support</h2>
          <p style={{ fontSize: 12.8, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{v.conclusion}</p>
        </section>

        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", maxWidth: 920 }}>
          <p style={{ fontSize: 11.8, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
            <b style={{ color: "var(--text)" }}>Provenance &amp; limits.</b> Source dataset de-identified; site and dataset
            name withheld. &ldquo;ACS&rdquo; is an initial clinical impression, not adjudicated Type&nbsp;1. The
            lactate/creatinine signal is partly confounded with the shock / mechanical-support subgroup, so it may track
            illness severity as well as Type&nbsp;2 biology. These results support hypothesis prioritization, not a
            validated clinical instrument. See the{" "}
            <a href="/about" style={{ color: "var(--accent)", fontWeight: 600 }}>Methods</a> page for atlas provenance.
          </p>
        </div>
      </main>
    </>
  );
}
