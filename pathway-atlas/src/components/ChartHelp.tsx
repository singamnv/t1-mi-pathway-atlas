"use client";
import { useState } from "react";

/**
 * Collapsible "How to read this" panel shown under a chart/table.
 * Keeps the dashboard uncluttered by default; expands to a structured
 * What-it-shows / How-to-read / Takeaway explanation on demand.
 */
export default function ChartHelp({
  what,
  read,
  takeaway,
}: {
  what?: React.ReactNode;
  read?: React.ReactNode;
  takeaway?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "transparent", border: "none", cursor: "pointer",
          color: "var(--accent)", fontSize: 12, fontWeight: 600,
          fontFamily: "var(--ff-mono)", textTransform: "uppercase", letterSpacing: 0.6,
          padding: 0,
        }}
      >
        <span aria-hidden style={{ fontSize: 10 }}>{open ? "▾" : "▸"}</span>
        How to read this
      </button>
      {open && (
        <div
          style={{
            marginTop: 8, padding: "12px 14px", borderRadius: 10,
            background: "var(--panel-2)", border: "1px solid var(--border)",
            fontSize: 12.5, lineHeight: 1.6, color: "var(--text-2)",
          }}
        >
          {what && <p style={{ margin: "0 0 8px" }}><b style={{ color: "var(--text)" }}>What it shows. </b>{what}</p>}
          {read && <p style={{ margin: "0 0 8px" }}><b style={{ color: "var(--text)" }}>How to read it. </b>{read}</p>}
          {takeaway && <p style={{ margin: 0 }}><b style={{ color: "var(--text)" }}>Takeaway. </b>{takeaway}</p>}
        </div>
      )}
    </div>
  );
}
