"use client";
import { useState } from "react";

/**
 * Small accessible tooltip: dotted-underlined trigger that reveals a styled
 * bubble on hover or keyboard focus. Used to explain each diagnostic
 * criterion wherever its (often abbreviated) label appears.
 *
 * `place` controls which side the bubble opens toward — use "below" for
 * elements near the top of the viewport (e.g. table headers) so the bubble
 * doesn't get clipped above the fold. `width` defaults to 250px.
 */
export default function InfoTip({
  text,
  children,
  place = "above",
  width = 250,
  align = "left",
}: {
  text: React.ReactNode;
  children: React.ReactNode;
  place?: "above" | "below";
  width?: number;
  align?: "left" | "right";
}) {
  const [show, setShow] = useState(false);
  const bubble: React.CSSProperties = {
    position: "absolute",
    [place === "above" ? "bottom" : "top"]: "calc(100% + 8px)",
    [align]: 0,
    zIndex: 70,
    width,
    maxWidth: "78vw",
    padding: "9px 12px",
    borderRadius: 9,
    background: "var(--text)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    textTransform: "none",
    boxShadow: "0 12px 30px -10px rgba(11,18,32,0.5)",
    pointerEvents: "none",
    whiteSpace: "normal",
  };
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        tabIndex={0}
        aria-label={typeof text === "string" ? text : undefined}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{ borderBottom: "1px dotted var(--muted-2)", cursor: "help", outline: "none" }}
      >
        {children}
      </span>
      {show && <span role="tooltip" style={bubble}>{text}</span>}
    </span>
  );
}
