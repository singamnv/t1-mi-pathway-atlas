import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container-x" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800 }}>404</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>That molecule or page was not found.</p>
      <Link href="/" style={{ color: "var(--accent)", fontWeight: 600, display: "inline-block", marginTop: 16 }}>← Back to the pathway</Link>
    </main>
  );
}
