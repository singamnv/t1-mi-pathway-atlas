import Link from "next/link";

// Landing hero from the Claude Design mockup: mono kicker, Space Grotesk headline,
// body with the molecule count emphasized, two CTAs.
export default function Hero({ nMolecules }: { nMolecules: number }) {
  return (
    <section
      style={{
        borderBottom: "1px solid var(--border)",
        background:
          "radial-gradient(1100px 460px at 18% -20%, rgba(99,102,241,0.10), transparent 70%), radial-gradient(900px 400px at 90% -10%, rgba(34,211,238,0.10), transparent 70%), var(--bg-warm)",
      }}
    >
      <div className="container-x" style={{ padding: "72px 24px 56px", maxWidth: 1120 }}>
        <div className="mono-kicker" style={{ letterSpacing: 1.6 }}>De novo molecular atlas</div>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 700, lineHeight: 1.04, letterSpacing: "-1.4px", margin: "16px 0 18px", color: "var(--text)", maxWidth: 900 }}
        >
          The Type&nbsp;I MI biomarker landscape, mapped to{" "}
          <span style={{ background: "var(--accent-grad)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            its step in the atherothrombotic cascade
          </span>
          .
        </h1>
        <p style={{ maxWidth: 660, color: "var(--muted)", fontSize: 16.5, lineHeight: 1.55 }}>
          CoronaryAtlas places{" "}
          <b style={{ color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{nMolecules.toLocaleString()} molecules</b>{" "}
          into the step of the atherothrombotic cascade where they act — surfaced by a ground-up harvest of the
          primary literature, omics repositories, clinical trials and human genetics, each with its evidence linked.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <a
            href="#cascade"
            className="font-mono"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 100,
              background: "var(--accent-grad)", color: "#fff", fontWeight: 600, fontSize: 13.5, letterSpacing: 0.3,
              boxShadow: "0 10px 24px -10px rgba(99,102,241,0.8)",
            }}
          >
            Walk the cascade <span aria-hidden>↓</span>
          </a>
          <Link
            href="/about"
            className="font-mono"
            style={{
              display: "inline-flex", alignItems: "center", padding: "12px 22px", borderRadius: 100,
              background: "var(--panel)", color: "var(--text-2)", fontWeight: 600, fontSize: 13.5, letterSpacing: 0.3,
              border: "1px solid var(--border-2)",
            }}
          >
            How it was built
          </Link>
        </div>
      </div>
    </section>
  );
}
