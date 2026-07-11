import Header from "@/components/Header";

export const metadata = { title: "Licensing" };

export default function LicensingPage() {
  return (
    <>
      <Header subtitle="Licensing" />
      <main className="container-x" style={{ padding: "26px 24px 70px", maxWidth: 820 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Licensing</h1>
        <p className="mono-kicker" style={{ marginBottom: 18 }}>How the atlas and its underlying data may be used</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://github.com/singamnv/t1-mi-pathway-atlas/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
            <img src="/badges/mit.svg" alt="Code license: MIT" height={24} style={{ display: "block" }} />
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">
            <img src="/badges/cc-by-nc.svg" alt="Data license: CC BY-NC 4.0" height={24} style={{ display: "block" }} />
          </a>
        </div>

        <P>
          CoronaryAtlas is <b>open source</b>. It is dual-licensed: the software is released under the permissive{" "}
          <b>MIT License</b>, and the curated dataset under <b>Creative Commons Attribution-NonCommercial 4.0
          (CC&nbsp;BY-NC&nbsp;4.0)</b>. The full source and license files live in the{" "}
          <a href="https://github.com/singamnv/t1-mi-pathway-atlas" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>GitHub repository</a>.
        </P>

        <H>Content &amp; data</H>
        <P>
          The curated CoronaryAtlas dataset — the molecule catalog, pathway-step placements, confidence and rationale
          annotations, and derived analytics — is released under <b>CC&nbsp;BY-NC&nbsp;4.0</b> for <b>non-commercial
          research and educational use</b>. You are free to share and adapt it for academic, clinical-research, and
          teaching purposes with attribution to <b>CoronaryAtlas</b>.
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
          The CoronaryAtlas web application and its contact backend are open source under the <b>MIT License</b> — free
          to use, modify, and redistribute (including commercially) with attribution. The full license text is in the{" "}
          <a href="https://github.com/singamnv/t1-mi-pathway-atlas/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>LICENSE file</a> of the source repository.
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
