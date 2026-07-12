import Header from "@/components/Header";
import { getMeta } from "@/lib/data";

export default function AboutPage() {
  const meta = getMeta();
  const d = meta.coverage_delta as Record<string, number>;
  const misses = (meta.coverage_delta as Record<string, unknown>).old_only_genuine_misses as string[] ?? [];
  const src = meta.harvest_sources;
  const dd = (meta as unknown as Record<string, unknown>).dedup as Record<string, number> | undefined;

  return (
    <>
      <Header subtitle="Methods & provenance" />
      <main className="container-x" style={{ padding: "26px 24px 70px", maxWidth: 880 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>Methods &amp; provenance</h1>

        <P>
          This atlas was built <b>de novo</b>: rather than starting from an existing biomarker list, every molecule was
          surfaced by an independent, ground-up harvest of primary evidence and then placed within the Type&nbsp;1
          (atherothrombotic) myocardial-infarction cascade.
        </P>

        <H>How the catalog was built</H>
        <ol style={{ paddingLeft: 20, lineHeight: 1.7, fontSize: 14, color: "var(--text)" }}>
          <li><b>Literature harvest.</b> Ten faceted PubMed queries spanning plaque rupture, ACS proteomics, MI genomics, platelet and coagulation markers, vascular inflammation, metabolomics, lipidomics, endothelial erosion and novel-biomarker discovery yielded {src.pubmed_abstracts_mined?.toLocaleString()} abstracts.</li>
          <li><b>Named-entity extraction.</b> Every abstract was mined with a language model to extract specific molecules tied to the atherothrombotic context, with a mechanistic role hint. Mentions were normalized to canonical names/genes and merged.</li>
          <li><b>Omics.</b> {src.omics_datasets} MI-relevant datasets from GEO, PRIDE and ArrayExpress were retained after relevance filtering and linked to molecules by title.</li>
          <li><b>Clinical trials.</b> {src.clinical_trials?.toLocaleString()} ClinicalTrials.gov studies of MI/ACS biomarkers and antithrombotic targets were scanned and linked.</li>
          <li><b>Human genetics.</b> {src.opentargets_genes} Open Targets disease-associated genes and {src.gwas_genes} GWAS-catalog MI genes were merged in; genetic-only genes were classified by function.</li>
          <li><b>Druggability.</b> Open Targets tractability and known-drug counts were attached for {src.druggability_records?.toLocaleString()} gene targets.</li>
          <li><b>Pathway placement.</b> Each molecule was assigned a primary cascade step with a confidence and a one-line rationale, synthesized from its harvested roles.</li>
          <li><b>Consolidation.</b> A curation pass merged entries that are the same analyte harvested at different granularity (free-text mentions vs. gene-anchored records, or gene-symbol aliases) into a single canonical entry, folding their evidence together. Genuinely distinct gene products — e.g. troponin&nbsp;I (TNNI3) vs. troponin&nbsp;T (TNNT2), or glycoprotein&nbsp;Ib subunits — were deliberately kept separate. This reduced the {dd?.raw_harvest_total?.toLocaleString?.() ?? "1,969"} raw harvested entries to <b>{dd?.deduplicated_total?.toLocaleString?.() ?? "1,948"}</b> distinct molecules ({dd?.duplicates_merged ?? 21} duplicates merged).</li>
        </ol>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, margin: "0 0 14px" }}>
          Counts throughout the site reflect the <b>deduplicated catalog ({dd?.deduplicated_total?.toLocaleString?.() ?? "1,948"} molecules)</b>. The raw
          harvest recovered {dd?.raw_harvest_total?.toLocaleString?.() ?? "1,969"} entries before consolidation. After deduplication, the markers
          with any direct head-to-head Type-1-vs-Type-2 study resolve to <b>six distinct analytes</b> (troponin&nbsp;I, CK-MB,
          copeptin, cardiac myosin-binding protein&nbsp;C, apolipoprotein&nbsp;E and cystatin&nbsp;C) — the earlier &ldquo;nine&rdquo; included
          redundant troponin/CK stand-ins now folded into their canonical entries.
        </p>

        <H>Coverage vs. our own earlier (abandoned) 260-molecule attempt</H>
        <P>
          <b>Both projects were created for the Anthropic Life Science Hackathon, and both were started after the hackathon
          was launched.</b> To avoid any confusion, the exact creation timestamps (from their git histories) are:
        </P>
        <ul style={{ margin: "0 0 12px 0", paddingLeft: 20, color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
          <li>
            <b>Earlier, abandoned attempt</b> (<a href="https://github.com/singamnv/t1t2-biomarker-miner" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>t1t2-biomarker-miner</a>):
            first commit <b>Tuesday, July 7, 2026 at 2:38 PM EDT</b> (6:38 PM UTC); abandoned the same day
            (last commit 8:51 PM EDT).
          </li>
          <li>
            <b>This project — CoronaryAtlas</b> (<a href="https://github.com/singamnv/t1-mi-pathway-atlas" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>t1-mi-pathway-atlas</a>):
            first commit <b>Thursday, July 9, 2026 at 9:42 PM EDT</b> (Friday, July 10, 2026 at 1:42 AM UTC).
          </li>
        </ul>
        <P>
          The 260-molecule catalog referenced here is therefore <b>not prior work by others</b> — it was <b>our own first
          attempt</b>, built roughly two days before this project during the same hackathon. That earlier build was
          <b> abandoned</b> because its approach was not leading to the right answer (the analysis had gone down the wrong
          path), so this project was started fresh with a clean de novo harvest. The comparison below is therefore an
          internal sanity check against our own discarded draft, <b>not</b> a reuse of external prior art. The code for that
          abandoned earlier project is archived at{" "}
          <a href="https://github.com/singamnv/t1t2-biomarker-miner" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>github.com/singamnv/t1t2-biomarker-miner</a>.
        </P>
        <P>
          As that cross-check, the de novo catalog ({d.denovo_catalog_size?.toLocaleString()} molecules) was compared to the
          abandoned 260-molecule draft. A robust name/gene match re-found <b>{d.old_refound}/{d.old_catalog_size} ({d.old_refound_pct}%)</b> of
          the earlier entries, and added <b>{d.denovo_new_vs_old?.toLocaleString()}</b> molecules that draft did not contain —
          confirming the fresh build is a strict superset of what we had before, arrived at by a sounder method.
        </P>
        <P>
          The {d.old_only_total} earlier-draft entries not matched are <b>all miRNA / lncRNA isoforms</b> that draft
          enumerated at finer granularity (e.g. miR-133a-3p, consolidated to miR-133 here) — the same molecules are
          present at family level. There are <b>no non-miRNA absences</b>: the one genuine protein miss (Gas6) has been
          harvested and added, and TMAO is present as Trimethylamine N-oxide. Matching uses gene symbol, normalized name,
          and full name-word containment, so entries like PAPP-A→PAPPA, PlGF→PGF, SORT1, PHACTR1, APOE and SAA1 are
          correctly counted as re-found.
        </P>

        <H>Confidence &amp; limitations</H>
        <P>
          Pathway-step assignment is an evidence-tagged inference, not a curated ground truth; each molecule carries a
          confidence dot (green/amber/grey). Molecule extraction from free-text abstracts is imperfect and can miss or
          mis-name entities. Trial and omics links are title-level string matches and are conservative. The atlas is a
          discovery-oriented map for hypothesis generation, not a clinical decision tool.
        </P>

        <H>Future directions</H>
        <P>
          CoronaryAtlas is a discovery-oriented map, not a finished clinical instrument. To make it accurate and
          responsible, our roadmap is:
        </P>
        <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(34,211,238,0.06))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "16px 18px", margin: "0 0 16px" }}>
          <ol style={{ paddingLeft: 20, lineHeight: 1.7, fontSize: 14, color: "var(--text)", margin: 0 }}>
            <li>
              <b>Companion ASCVD risk-biomarker atlas.</b> A sibling atlas mapping biomarkers of atherosclerotic
              cardiovascular disease <i>risk</i> — the prediction-and-prevention side of the same biology — now in
              development at{" "}
              <a href="https://ascvd.coronaryatlas.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>ascvd.coronaryatlas.com</a>.
              Together the two atlases span the arc from long-term risk to the acute Type-1 MI event.
            </li>
            <li><b>Quote-grounded, full-text evidence.</b> Move from abstract-level mining to PMC full text, attaching the verbatim supporting sentence to every scored claim so a reviewer can check each one directly.</li>
            <li><b>Adjudicated, multi-center validation.</b> Validate against a cohort with MI type adjudicated to the Fourth Universal Definition and report real discrimination metrics (AUC, sensitivity/specificity) following STARD, and TRIPOD if a multi-marker model is built.</li>
            <li><b>Prospective marker panel.</b> Develop and prospectively test a panel (a rupture-axis marker plus a demand/confounder marker), since the atlas shows no single analyte cleanly separates the two MI types.</li>
            <li><b>Expert curation & a living catalog.</b> Add a cardiologist curation layer for the Tier-1 markers and maintain the catalog as a versioned, periodically re-harvested resource.</li>
          </ol>
        </div>

        <H>Source code</H>
        <P>
          This project — the CoronaryAtlas app, the de novo catalog, scoring and methodology — is open source at{" "}
          <a href="https://github.com/singamnv/t1-mi-pathway-atlas" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>github.com/singamnv/t1-mi-pathway-atlas</a>.
        </P>

        <H>Summary figures</H>
        <P>Static, publication-style summaries of the catalog. Interactive versions are on the <a href="/dashboard" style={{ color: "var(--accent)", fontWeight: 600 }}>dashboard</a>.</P>
        <Figure src="/figures/pathway_distribution.png" caption="Molecules cataloged per atherothrombotic cascade step; hatched overlay marks druggable targets." />
        <Figure src="/figures/evidence_matrix.png" caption="Evidence coverage by step — each cell is a molecule count, colored by the fraction of that step's molecules carrying the evidence type." />
        <Figure src="/figures/type_composition.png" caption="Molecule-type composition within each cascade step." />
        <Figure src="/figures/type_confidence.png" caption="Overall distribution by molecule type (left) and pathway-step assignment confidence (right)." />
      </main>
    </>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", margin: "0 0 14px" }}>{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 17, fontWeight: 750, margin: "26px 0 10px" }}>{children}</h2>;
}
function Figure({ src, caption }: { src: string; caption: string }) {
  return (
    <figure style={{ margin: "0 0 22px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--panel-2)" }} />
      <figcaption style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>{caption}</figcaption>
    </figure>
  );
}
