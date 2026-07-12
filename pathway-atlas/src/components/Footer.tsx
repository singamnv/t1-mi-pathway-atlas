import Link from "next/link";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Pathway" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/discrimination", label: "T1 vs T2" },
      { href: "/diagnostic", label: "Diagnostic" },
      { href: "/validation", label: "Validation" },
      { href: "/table", label: "Table" },
      { href: "/molecules", label: "Molecules" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/about", label: "Methods & provenance" },
      { href: "/about-me", label: "About" },
      { href: "/contact", label: "Contact & suggestions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/licensing", label: "Licensing" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container-x site-footer-inner">
        <div style={{ maxWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="CoronaryAtlas logo" width={30} height={30} style={{ borderRadius: 9, display: "block" }} />
            <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>CoronaryAtlas</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
            A de novo molecular atlas of the Type&nbsp;1 (atherothrombotic) myocardial-infarction pathway.
            A discovery-oriented research map — not a clinical decision tool.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4>{c.title}</h4>
            {c.links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            {c.title === "Project" && (
              <a href="https://github.com/singamnv/t1-mi-pathway-atlas" target="_blank" rel="noopener noreferrer">
                GitHub repository ↗
              </a>
            )}
            {c.title === "Explore" && (
              <a href="https://ascvd.coronaryatlas.com" target="_blank" rel="noopener noreferrer">
                ASCVD Risk Atlas ↗
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="container-x" style={{ padding: "0 24px 30px", fontSize: 12, color: "var(--muted-2)" }}>
        © {year} CoronaryAtlas · Open source — code MIT, data{" "}
        <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>CC BY-NC 4.0</a>{" "}
        · For research and educational use only.
      </div>
    </footer>
  );
}
