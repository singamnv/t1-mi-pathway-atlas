// Canonical per-cascade-step colors from the Claude Design "Pathway Atlas" system.
// Mirrors the .step-sX --c values in globals.css. Single source so every table,
// pill, node and chart uses the same hue per step.
export const STEP_COLOR: Record<string, string> = {
  s1_lipid: "#f5b13d",
  s2_inflammation: "#ff6b6b",
  s3_rupture: "#f43f5e",
  s4_endothelial: "#22d3ee",
  s5_platelet: "#a78bfa",
  s6_thromboxane: "#fb923c",
  s7_coagulation: "#ef4444",
  s8_injury: "#f472b6",
  s0_systemic: "#8a97ad",
};

export function stepColor(step: string): string {
  return STEP_COLOR[step] ?? "#8a97ad";
}

// Gradient between two consecutive step hues (used for the animated cascade connector).
export function stepGradient(from: string, to: string): string {
  return `linear-gradient(90deg, ${stepColor(from)}, ${stepColor(to)})`;
}
