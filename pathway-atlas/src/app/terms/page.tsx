import Header from "@/components/Header";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <Header subtitle="Terms of Service" />
      <main className="container-x" style={{ padding: "26px 24px 70px", maxWidth: 820 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Terms of Service</h1>
        <p className="mono-kicker" style={{ marginBottom: 22 }}>Please read these terms before using CoronaryAtlas</p>

        <H>1. Research &amp; educational use only</H>
        <P>
          CoronaryAtlas is a discovery-oriented research map intended for scientific, academic and educational purposes.
          By using the site you agree to use it for those purposes and in compliance with applicable laws and
          institutional policies.
        </P>

        <H>2. Not medical advice</H>
        <P>
          <b>CoronaryAtlas is not a medical device and does not provide medical advice, diagnosis, or treatment.</b>{" "}
          Nothing on this site should be used to guide the care of any individual patient. Pathway placements,
          discrimination scores, and diagnostic-utility views are research hypotheses generated from literature-mined
          data, not clinically validated tools. Clinical decisions must be made by a qualified healthcare professional
          with access to the full patient context.
        </P>

        <H>3. Accuracy &amp; limitations</H>
        <P>
          The data is assembled by automated harvesting and language-model extraction from public sources and is
          therefore imperfect: it may contain missing entries, mis-named entities, incorrect pathway assignments, or
          out-of-date associations. The atlas is provided <b>“as is”</b> and <b>“as available”</b>, without warranty of
          any kind, express or implied, including fitness for a particular purpose.
        </P>

        <H>4. Limitation of liability</H>
        <P>
          To the maximum extent permitted by law, the author of CoronaryAtlas shall not be liable for any direct,
          indirect, incidental, or consequential damages arising from the use of, or inability to use, the site or its
          data.
        </P>

        <H>5. User submissions</H>
        <P>
          If you submit a molecule suggestion or feedback via the{" "}
          <a href="/contact" style={{ color: "var(--accent)", fontWeight: 600 }}>contact form</a>, you grant the author
          permission to review and, at their discretion, incorporate the substance of that submission into the atlas.
          Do not submit confidential, patient-identifiable, or proprietary information.
        </P>

        <H>6. Third-party sources</H>
        <P>
          Links and references to external databases are provided for convenience; their content and availability are
          governed by those third parties and their respective terms. See the{" "}
          <a href="/licensing" style={{ color: "var(--accent)", fontWeight: 600 }}>Licensing</a> page.
        </P>

        <H>7. Changes</H>
        <P>
          These terms may be updated as the project evolves. Continued use of the site after changes constitutes
          acceptance of the revised terms.
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
