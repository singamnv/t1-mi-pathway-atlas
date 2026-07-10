import fs from "node:fs";
import path from "node:path";
import type { Pathway, MoleculeSlim, EvidenceBundle, Meta, StepId, Stats } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function readJSON<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, rel), "utf-8")) as T;
}

export function getPathway(): Pathway { return readJSON<Pathway>("pathway.json"); }
export function getMeta(): Meta { return readJSON<Meta>("meta.json"); }
export function getMolecules(): MoleculeSlim[] { return readJSON<MoleculeSlim[]>("molecules.json"); }
export function getStats(): Stats { return readJSON<Stats>("stats.json"); }
export function getDiscrimination(): import("./types").DiscRecord[] { return readJSON("discrimination.json"); }
export function getDiscriminationMeta(): Record<string, unknown> { return readJSON("discrimination_meta.json"); }
export function getDiscriminationFor(molId: string): import("./types").DiscRecord | null {
  const all = readJSON<import("./types").DiscRecord[]>("discrimination.json");
  return all.find((d) => d.mol_id === molId) ?? null;
}
export function getDiscriminationDetail(molId: string): Record<string, unknown> | null {
  const all = readJSON<Record<string, Record<string, unknown>>>("discrimination_detail.json");
  return all[molId] ?? null;
}
export interface AssayProfile {
  analyte: string; specimen: string; tube_detail: string[]; method: string;
  reagent: string; platform: string; turnaround: string; avail: string; specificity_flag: string;
}
export function getAssayFor(molId: string): AssayProfile | null {
  const all = readJSON<Record<string, AssayProfile>>("assays.json");
  return all[molId] ?? null;
}
export interface DxRecord {
  mol_id: string; name: string; gene: string | null; type: string; step: string;
  tier: string; cls: string | null;
  feasibility: number | null; evidence: number | null; rupture: number | null;
  demand_spec: number | null; direct_t1: number | null; novelty: number | null;
  dx_performance?: number | null; dx_kinetics?: number | null; dx_incremental?: number | null;
  dc: number; inc: boolean; npmids: number;
}
export function getDxUtility(): DxRecord[] { return readJSON<DxRecord[]>("dx_utility.json"); }
// Rich dashboard analytics (precomputed distributions)
export function getDashboardAnalytics(): Record<string, unknown> {
  return readJSON<Record<string, unknown>>("dashboard_analytics.json");
}
export function getCrossfilter(): Record<string, unknown> {
  return readJSON<Record<string, unknown>>("crossfilter.json");
}

export function getEvidence(molId: string): EvidenceBundle | null {
  const p = path.join(DATA_DIR, "evidence", molId + ".json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8")) as EvidenceBundle;
}

export function getAllMolIds(): string[] {
  return getMolecules().map((m) => m.mol_id);
}

export function moleculesByStep(): Record<StepId, MoleculeSlim[]> {
  const out = {} as Record<StepId, MoleculeSlim[]>;
  for (const m of getMolecules()) {
    (out[m.pathway_step] ??= []).push(m);
  }
  for (const k of Object.keys(out) as StepId[]) {
    out[k].sort((a, b) =>
      (b.n_references - a.n_references) ||
      (b.n_trials - a.n_trials) ||
      a.name.localeCompare(b.name));
  }
  return out;
}
