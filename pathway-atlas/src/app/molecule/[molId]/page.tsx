import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getAllMolIds, getEvidence, getPathway, getDiscriminationFor, getDiscriminationDetail, getAssayFor } from "@/lib/data";

export function generateStaticParams() {
  return getAllMolIds().map((molId) => ({ molId }));
}

const stepColor: Record<string, string> = {
  s1_lipid: "#f2c14e", s2_inflammation: "#ef6f6c", s3_rupture: "#d7263d",
  s4_endothelial: "#4cc9f0", s5_platelet: "#b388eb", s6_thromboxane: "#f79d65",
  s7_coagulation: "#e63946", s8_injury: "#ff8fa3", s0_systemic: "#7d8ca3",
};

export default async function MoleculePage({ params }: { params: Promise<{ molId: string }> }) {
  const { molId } = await params;
  const ev = getEvidence(molId);
  if (!ev) notFound();
  const pathway = getPathway();
  const step = pathway.steps.find((s) => s.step_id === ev.pathway_step);
  const c = stepColor[ev.pathway_step] ?? "#7d8ca3";
  const ge = ev.genetic_evidence ?? {};
  const hasGenetic = ge.opentargets_score != null || (ge.gwas_traits && ge.gwas_traits.length > 0);
  const disc = getDiscriminationFor(molId);
  const discDetail = getDiscriminationDetail(molId);
  const assay = getAssayFor(molId);

  return (
    <>
      <Header subtitle={ev.canonical_name} />
      <main className="container-x" style={{ padding: "26px 24px 60px" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          <Link href="/">Pathway</Link>
          {step && <> {" / "} <Link href={`/step/${step.step_id}`} style={{ color: c }}>{step.name}</Link></>}
        </div>

        {/* Title block */}
        <div style={{ borderLeft: `4px solid ${c}`, paddingLeft: 16, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 30, fontWeight: 800 }}>{ev.canonical_name}</h1>
            {ev.gene_symbol && <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 16, color: "var(--muted)" }}>{ev.gene_symbol}</span>}
            <span style={{ fontSize: 11.5, padding: "2px 9px", borderRadius: 20, background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              {ev.mol_type}
            </span>
          </div>
          {ev.mechanism && <p style={{ fontSize: 15, marginTop: 8, maxWidth: 820, lineHeight: 1.55 }}>{ev.mechanism}</p>}
        </div>

        {/* Pathway placement + evidence summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <Panel title="Pathway placement">
            <Row label="Cascade step" value={step ? step.name : ev.pathway_step} color={c} />
            <Row label="Confidence" value={ev.step_confidence} />
            {ev.step_rationale && <Row label="Rationale" value={ev.step_rationale} />}
            {ev.pathway_step_secondary?.length > 0 && (
              <Row label="Also acts in" value={ev.pathway_step_secondary.map((s) => pathway.steps.find((x) => x.step_id === s)?.short ?? s).join(", ")} />
            )}
          </Panel>
          <Panel title="Druggability">
            {ev.druggable == null ? (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Not assessed (no mapped human gene target).</div>
            ) : (
              <>
                <Row label="Druggable" value={ev.druggable ? "Yes" : "No"} color={ev.druggable ? "#43d17a" : undefined} />
                {ev.known_drugs != null && <Row label="Known drugs / candidates" value={String(ev.known_drugs)} />}
                <Row label="Small-molecule tractable" value={ev.sm_tractable ? "Yes" : "No"} />
                <Row label="Antibody tractable" value={ev.ab_tractable ? "Yes" : "No"} />
                {ev.ensembl && <Row label="Ensembl" value={ev.ensembl} />}
              </>
            )}
          </Panel>
        </div>

        {/* Type I vs Type II discrimination */}
        {disc && (disc.R_score != null || disc.C_score != null || disc.D_score != null) && (
          <DiscPanel disc={disc} detail={discDetail} />
        )}

        {/* Assay & specimen */}
        {assay && <AssayPanel a={assay} />}

        {/* Genetic evidence */}
        {hasGenetic && (
          <Section title="Human genetic evidence" count={undefined}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {ge.opentargets_score != null && (
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#43d17a" }}>{ge.opentargets_score.toFixed(3)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Open Targets association ({ge.ot_disease})</div>
                </div>
              )}
              {ge.gwas_n_assoc != null && (
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#43d17a" }}>{ge.gwas_n_assoc}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>GWAS associations</div>
                </div>
              )}
              {ge.gwas_traits && ge.gwas_traits.length > 0 && (
                <div style={{ fontSize: 12.5, color: "var(--muted)", alignSelf: "center" }}>
                  Traits: {ge.gwas_traits.join(", ")}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* References */}
        <Section title="Literature evidence" count={ev.counts.references}>
          {ev.references.length === 0 ? (
            <Empty>No direct literature mentions harvested; included via genetic/target evidence.</Empty>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {ev.references.map((r) => (
                <li key={r.pmid} style={{ padding: "9px 12px", background: "var(--panel-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, fontWeight: 600, color: "#4cc9f0" }}>
                    {r.title || `PMID ${r.pmid}`}
                  </a>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                    {[r.journal, r.year].filter(Boolean).join(" · ")} · PMID {r.pmid}
                    {r.doi && <> · <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)", textDecoration: "underline" }}>doi</a></>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {ev.counts.references > ev.references.length && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              Showing {ev.references.length} of {ev.counts.references} linked references.
            </div>
          )}
        </Section>

        {/* Trials */}
        {ev.trials.length > 0 && (
          <Section title="Clinical trials" count={ev.counts.trials}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {ev.trials.map((t) => (
                <li key={t.nct_id} style={{ padding: "9px 12px", background: "var(--panel-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <a href={`https://clinicaltrials.gov/study/${t.nct_id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, fontWeight: 600, color: "#f2c14e" }}>
                    {t.title || t.nct_id}
                  </a>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                    {[t.nct_id, t.phase, t.status].filter(Boolean).join(" · ")}
                    {t.interventions?.length > 0 && <> · {t.interventions.join(", ")}</>}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Omics */}
        {ev.omics_datasets.length > 0 && (
          <Section title="Omics datasets" count={ev.counts.omics}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {ev.omics_datasets.map((o) => (
                <li key={o.accession} style={{ padding: "9px 12px", background: "var(--panel-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#b388eb", fontFamily: "ui-monospace, monospace" }}>{o.accession}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>{o.archive}</span>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{o.title}</div>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 10, fontWeight: 700 }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0", fontSize: 13, borderBottom: "1px solid #ffffff08" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 600, color: color ?? "var(--text)", textAlign: "right" }}>{value}</span>
    </div>
  );
}
function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 750, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        {title}
        {count != null && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>({count})</span>}
      </h2>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "var(--muted)", fontSize: 13, fontStyle: "italic" }}>{children}</div>;
}

const ASSAY_FLAG: Record<string, { label: string; color: string }> = {
  validated_clinical: { label: "Validated clinical assay", color: "#43d17a" },
  specialized_method: { label: "Specialized reference method", color: "#f2c14e" },
  class_default: { label: "Class-level default (no specific cleared assay)", color: "#8b98a9" },
};
function AssayPanel({ a }: { a: import("@/lib/data").AssayProfile }) {
  const flag = ASSAY_FLAG[a.specificity_flag] ?? ASSAY_FLAG.class_default;
  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ padding: "7px 0", borderBottom: "1px solid #ffffff08" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: "var(--text)" }}>{value}</div>
    </div>
  );
  return (
    <Section title="Assay & specimen" count={undefined}>
      <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, padding: "2px 10px", borderRadius: 20, background: flag.color + "22", color: flag.color, border: `1px solid ${flag.color}44` }}>
            {flag.label}
          </span>
          {a.specificity_flag === "class_default" && (
            <span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: 10 }}>
              — generic method inferred from analyte class; confirm against a specific product insert before use.
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
          <Field label="Specimen" value={a.specimen} />
          <Field label="Collection tube" value={a.tube_detail.join(" · ")} />
          <Field label="Method / principle" value={a.method} />
          <Field label="Reagent / substrate" value={a.reagent} />
          <Field label="Platform" value={a.platform} />
          <Field label="Turnaround · availability" value={`${a.turnaround} · ${a.avail}`} />
        </div>
      </div>
    </Section>
  );
}
const CONF_ORDER = [
  "sepsis / systemic inflammation", "anemia / acute blood loss", "hypovolemia / dehydration",
  "tachyarrhythmia", "hypoxemia / respiratory failure", "hypertensive emergency", "high-demand / peri-operative stress",
];
/* eslint-disable @typescript-eslint/no-explicit-any */
function DiscPanel({ disc, detail }: { disc: any; detail: any }) {
  const bar = (v: number | null, color: string) => (
    <div style={{ flex: 1, height: 7, background: "#ffffff10", borderRadius: 4, overflow: "hidden" }}>
      {v != null && <div style={{ width: `${Math.max(0, Math.min(100, v))}%`, height: "100%", background: color }} />}
    </div>
  );
  const scoreRow = (label: string, v: number | null, color: string, hint: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <span style={{ width: 190, fontSize: 12.5, color: "var(--muted)" }} title={hint}>{label}</span>
      {bar(v, color)}
      <span style={{ width: 38, textAlign: "right", fontSize: 13, fontWeight: 600, color: v == null ? "#4b5563" : "var(--text)" }}>
        {v == null ? "—" : v.toFixed(0)}
      </span>
    </div>
  );
  const cv = (detail?.conf_vector ?? []) as any[];
  const t1 = (disc.D_score ?? 0) > 0;
  return (
    <Section title="Type I vs Type II discrimination" count={undefined}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Scores</span>
            <span style={{ fontSize: 11.5, padding: "1px 9px", borderRadius: 20, background: "#b388eb22", color: "#b388eb", border: "1px solid #b388eb44" }}>
              {disc.disc_class}
            </span>
          </div>
          {scoreRow("R — rupture / Type-I", disc.R_score, "#4cc9f0", "Plaque-rupture responsiveness (0-100)")}
          {scoreRow("C — confounder / Type-II", disc.C_score, "#f2854e", "Confounder responsiveness (0-100, higher=worse)")}
          {scoreRow("A — assay feasibility", disc.A_score, "#72b7b2", "How easily measured (0-100)")}
          {scoreRow("E — evidence strength", disc.E_score, "#9d8df1", "GRADE-like evidence strength (0-100)")}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
            {scoreRow("T1DI (composite)", disc.T1DI, "#43d17a", "Type-I Discrimination Index (0-100)")}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              <span>Specificity differential (R−C)</span>
              <span style={{ color: (disc.spec_final ?? 0) > 0 ? "#43d17a" : "#f2854e", fontWeight: 600 }}>
                {disc.spec_final == null ? "—" : (disc.spec_final > 0 ? "+" : "") + disc.spec_final}
              </span>
            </div>
          </div>
          {disc.D_score != null && (
            <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 8, background: (t1 ? "#43d17a" : "#f2854e") + "14", border: `1px solid ${(t1 ? "#43d17a" : "#f2854e")}44` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t1 ? "#43d17a" : "#f2854e" }}>
                Direct evidence: {t1 ? "higher in Type I" : "higher in Type II"} (D={disc.D_score > 0 ? "+" : ""}{disc.D_score})
              </div>
              {disc.D_finding && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>{disc.D_finding}</div>}
            </div>
          )}
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Confounder panel (Type-II drivers)</div>
          {cv.length === 0 ? (
            <Empty>No confounder evidence retrieved.</Empty>
          ) : (
            CONF_ORDER.map((name, i) => {
              const c = cv.find((x: any) => (x.confounder ?? "").startsWith(name.split(" /")[0])) ?? cv[i];
              const mag = c?.magnitude;
              const col = mag == null ? "#3a4550" : mag >= 3 ? "#ef6f6c" : mag === 2 ? "#f2854e" : mag === 1 ? "#f2c14e" : "#5a6675";
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 12 }}>
                  <span style={{ width: 16, color: "var(--muted)" }}>{i + 1}</span>
                  <span style={{ flex: 1, color: "var(--muted)" }}>{name}</span>
                  <span style={{ display: "inline-block", width: 54, textAlign: "center", fontSize: 11, padding: "1px 0", borderRadius: 5, background: col + "22", color: col, border: `1px solid ${col}44` }}>
                    {mag == null ? "n/a" : `mag ${mag}`}
                  </span>
                </div>
              );
            })
          )}
          {detail?.C_coverage != null && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
              Coverage: {Math.round(detail.C_coverage * 7)}/7 confounders with evidence
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>
        Tier: {disc.tier === "tier1_deep" ? "deep-scored (abstract-extracted)" : disc.tier === "tier2_light" ? "light (literature co-occurrence proxy — lower confidence)" : "insufficient evidence"}
        {disc.n_pmids > 0 && ` · ${disc.n_pmids} supporting references`}. See the <Link href="/discrimination" style={{ color: "var(--accent)" }}>discrimination table</Link> for all markers.
      </div>
    </Section>
  );
}
