"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface CascadeStep {
  id: string;
  short: string;
  name: string;
  count: number;
  desc: string;
  anchors: string;
  color: string;
}

const FLOW_GRADIENT =
  "linear-gradient(90deg,#f5b13d,#ff6b6b,#f43f5e,#22d3ee,#a78bfa,#fb923c,#ef4444,#f472b6)";

export default function CascadeExplorer({ steps }: { steps: CascadeStep[] }) {
  const [sel, setSel] = useState(0);
  const paused = useRef(false);

  // Auto-advance through the cascade; pause on hover/focus within.
  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setSel((s) => (s + 1) % steps.length);
    }, 3200);
    return () => clearInterval(t);
  }, [steps.length]);

  const s = steps[sel];

  return (
    <div
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div className="mono-kicker" style={{ marginBottom: 16 }}>tap a step • auto-advancing</div>

      {/* node rail with animated flow connector */}
      <div style={{ position: "relative", padding: "6px 0 4px" }}>
        <div
          aria-hidden
          className="cascade-flowline"
          style={{
            position: "absolute", left: 26, right: 26, top: 28, height: 3, transform: "translateY(-50%)",
            background: FLOW_GRADIENT, backgroundSize: "200% 100%", animation: "flow 3s linear infinite",
            borderRadius: 3, opacity: 0.55,
          }}
        />
        <div className="cascade-rail" style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 6 }}>
          {steps.map((st, i) => {
            const active = i === sel;
            return (
              <button
                key={st.id}
                onClick={() => setSel(i)}
                aria-label={`Step ${i + 1}: ${st.name}`}
                aria-pressed={active}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  background: "transparent", border: "none", cursor: "pointer", flex: "1 1 0", minWidth: 0,
                }}
              >
                <span
                  className="font-display"
                  style={{
                    width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center",
                    color: "#fff", fontWeight: 700, fontSize: 15,
                    background: `linear-gradient(135deg, ${st.color}, ${st.color}cc)`,
                    border: "3px solid var(--panel)",
                    boxShadow: active
                      ? `0 0 0 3px ${st.color}, 0 10px 22px -8px ${st.color}`
                      : "0 2px 6px rgba(11,18,32,0.14)",
                    transform: active ? "scale(1.14)" : "scale(1)",
                    transition: "all .35s cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 9.5, lineHeight: 1.2, textAlign: "center", maxWidth: 92,
                    color: active ? st.color : "var(--muted-2)", fontWeight: active ? 600 : 500,
                    transition: "color .3s",
                  }}
                >
                  {st.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* bound detail panel */}
      <div
        style={{
          marginTop: 22, borderRadius: "var(--r-lg)", background: "var(--panel)",
          border: "1px solid var(--border)", borderTop: `3px solid ${s.color}`,
          boxShadow: "var(--shadow-float)", padding: "22px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div className="mono-kicker" style={{ color: s.color }}>
            STEP {String(sel + 1).padStart(2, "0")} • {s.short}
          </div>
          <div className="font-mono" style={{ fontSize: 12, color: "var(--muted)" }}>
            <b style={{ color: "var(--text)", fontSize: 15 }}>{s.count.toLocaleString()}</b> molecules placed here
          </div>
        </div>
        <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--text)", margin: "10px 0 8px" }}>
          {s.name}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 780 }}>{s.desc}</p>
        <div className="font-mono" style={{ marginTop: 12, fontSize: 12, color: "var(--muted-2)", letterSpacing: 0.2 }}>
          <span style={{ color: s.color }}>anchors ›</span> {s.anchors}
        </div>
        <Link
          href={`/step/${s.id}`}
          className="font-mono"
          style={{ display: "inline-block", marginTop: 16, fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}
        >
          Explore all {s.count.toLocaleString()} molecules in this step →
        </Link>
      </div>
    </div>
  );
}
