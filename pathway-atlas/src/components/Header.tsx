import Link from "next/link";

export default function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg,#0d1420, #0a0e14)",
        position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(6px)",
      }}
    >
      <div className="container-x" style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent)", display: "grid", placeItems: "center", fontWeight: 800, color: "#0a0e14" }}>
            T1
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>Type&nbsp;1 MI Pathway Atlas</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{subtitle ?? "Atherothrombotic cascade · de novo molecular map"}</div>
          </div>
        </Link>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 13.5, color: "var(--muted)" }}>
          <Link href="/">Pathway</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/discrimination">T1 vs T2</Link>
          <Link href="/diagnostic">Diagnostic</Link>
          <Link href="/table">Table</Link>
          <Link href="/molecules">Molecules</Link>
          <Link href="/about">Methods</Link>
        </nav>
      </div>
    </header>
  );
}
