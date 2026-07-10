import type { ReactNode } from "react";

// Numbered chapter header used across the guided-tour home page (e.g. "01 · PATHWAY").
export default function Chapter({
  num,
  kicker,
  title,
  subtitle,
  id,
  children,
}: {
  num: string;
  kicker: string;
  title: string;
  subtitle?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} style={{ padding: "44px 0 8px", scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
        <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", letterSpacing: 0.5 }}>{num}</span>
        <span className="mono-kicker">{kicker}</span>
      </div>
      <h2 className="font-display" style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 600, letterSpacing: "-0.6px", color: "var(--text)" }}>
        {title}
      </h2>
      {subtitle && <p style={{ marginTop: 6, color: "var(--muted)", fontSize: 14.5, lineHeight: 1.5, maxWidth: 720 }}>{subtitle}</p>}
      <div style={{ marginTop: 20 }}>{children}</div>
    </section>
  );
}
