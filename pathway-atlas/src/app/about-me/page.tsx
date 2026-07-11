import Header from "@/components/Header";

export const metadata = { title: "About" };

export default function AboutMePage() {
  return (
    <>
      <Header subtitle="About" />
      <main className="container-x" style={{ padding: "26px 24px 70px", maxWidth: 820 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>About</h1>

        <div
          style={{
            display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
            background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)", padding: 22, boxShadow: "var(--shadow-sm)", marginBottom: 26,
          }}
        >
          <div
            style={{
              width: 68, height: 68, borderRadius: 18, background: "var(--accent-grad)",
              display: "grid", placeItems: "center", flex: "0 0 auto",
              boxShadow: "0 10px 26px -12px rgba(99,102,241,0.8)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={46} height={46} style={{ borderRadius: 12, display: "block" }} />
          </div>
          <div style={{ minWidth: 220, flex: 1 }}>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              Narayana Sarma V. Singam, MD, FACC
            </div>
            <div className="mono-kicker" style={{ marginTop: 4 }}>
              Cardiologist · Biomedical engineer · ML / AI
            </div>
            <div style={{ marginTop: 8 }}>
              <a href="https://sarmasingam.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>
                sarmasingam.com ↗
              </a>
            </div>
          </div>
        </div>

        <P>
          I am <b>Narayana Sarma V. Singam, MD, FACC</b> — a <b>cardiologist</b> and <b>biomedical engineer</b> with a
          focus on <b>machine learning and AI</b>, and a strong interest in <b>developing software at the frontiers of
          medicine</b>. More about my work is at{" "}
          <a href="https://sarmasingam.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>sarmasingam.com</a>.
        </P>
        <P>
          CoronaryAtlas grew out of that interest: an attempt to map every candidate molecule of a Type&nbsp;1
          (atherothrombotic) myocardial infarction to the point in the cascade where it acts, built from a ground-up
          harvest of the primary literature, omics repositories, clinical trials and human genetics rather than from a
          pre-existing biomarker list. The goal is a transparent, evidence-linked research map that can seed
          hypotheses at the intersection of cardiovascular medicine, data science and drug discovery.
        </P>
        <P style={{ marginTop: 18 }}>
          Have a molecule you think is missing, or feedback on the atlas?{" "}
          <a href="/contact" style={{ color: "var(--accent)", fontWeight: 600 }}>Get in touch</a>.
        </P>
      </main>
    </>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-2)", margin: "0 0 15px", ...style }}>{children}</p>;
}
