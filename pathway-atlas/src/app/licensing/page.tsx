import Header from "@/components/Header";

export const metadata = { title: "Licensing" };

export default function LicensingPage() {
  return (
    <>
      <Header subtitle="Licensing" />
      <main className="container-x" style={{ padding: "26px 24px 70px", maxWidth: 820 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Licensing</h1>
        <p className="mono-kicker" style={{ marginBottom: 22 }}>How the atlas and its underlying data may be used</p>

        <H>Content &amp; data</H>
        <P>
          The curated CoronaryAtlas dataset — the molecule catalog, pathway-step placements, confidence and rationale
          annotations, and derived analytics — is released for <b>non-commercial research and educational use</b>. You
          are free to explore, download, and reuse it for academic, clinical-research, and teaching purposes with
          attribution to <b>CoronaryAtlas</b>.
        </P>
        <P>
          Attribution suggestion: “Data from CoronaryAtlas — a de novo molecular atlas of the Type&nbsp;1 myocardial
          infarction pathway.” If you use the atlas in a publication, a citation and a note to the author (via the{" "}
          <a href="/contact" style={{ color: "var(--accent)", fontWeight: 600 }}>contact page</a>) are appreciated.
        </P>

        <H>Underlying sources</H>
        <P>
          CoronaryAtlas is assembled from public biomedical resources — PubMed / PMC, GEO, PRIDE, ArrayExpress,
          ClinicalTrials.gov, Open Targets and the GWAS Catalog. Each of those sources carries its own terms of use and
          licensing; where the atlas links out to or reproduces identifiers, titles, or counts from a source, that
          source&apos;s terms continue to apply. CoronaryAtlas claims no ownership over the primary records it indexes.
        </P>

        <H>Software</H>
        <P>
          The CoronaryAtlas web application is provided as-is for research and educational use. If a formal open-source
          license is later attached to the codebase, it will be stated here and in the source repository.
        </P>

        <H>No warranty</H>
        <P>
          The atlas is provided <b>without warranty of any kind</b>, express or implied. Pathway placements and
          discrimination scores are evidence-tagged inferences, not curated ground truth, and may contain extraction or
          normalization errors. See the{" "}
          <a href="/terms" style={{ color: "var(--accent)", fontWeight: 600 }}>Terms of Service</a> for the full
          disclaimer.
        </P>
      </main>
    </>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-2)", margin: "0 0 15px" }}>{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 17, fontWeight: 750, margin: "26px 0 10px", color: "var(--text)" }}>{children}</h2>;
}
