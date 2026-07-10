export type StepId =
  | "s1_lipid" | "s2_inflammation" | "s3_rupture" | "s4_endothelial"
  | "s5_platelet" | "s6_thromboxane" | "s7_coagulation" | "s8_injury" | "s0_systemic";

export interface PathwayStep {
  step_id: StepId;
  order: number;
  name: string;
  short: string;
  icon: string;
  description: string;
  anchors: string[];
  n_molecules: number;
  n_druggable: number;
  n_with_trials: number;
}
export interface Pathway {
  title: string;
  subtype: string;
  description: string;
  steps: PathwayStep[];
  edges: [string, string][];
}
export interface MoleculeSlim {
  mol_id: string;
  name: string;
  gene_symbol: string | null;
  mol_type: string;
  pathway_step: StepId;
  step_confidence: "high" | "medium" | "low";
  n_references: number;
  n_trials: number;
  n_omics: number;
  druggable: boolean | null;
  has_genetic: boolean;
  mechanism: string;
}
export interface Reference { pmid: string; title: string; journal: string; year: string; doi: string; }
export interface Trial { nct_id: string; title: string; status: string; phase: string; interventions: string[]; }
export interface OmicsDataset { accession: string; archive: string; title: string; n_samples: number | null; }
export interface GeneticEvidence {
  opentargets_score?: number; ot_disease?: string;
  gwas_traits?: string[]; gwas_n_assoc?: number;
}
export interface EvidenceBundle {
  mol_id: string; canonical_name: string; gene_symbol: string | null; mol_type: string;
  pathway_step: StepId; pathway_step_secondary: string[];
  step_confidence: string; step_rationale: string; mechanism: string;
  druggable: boolean | null; known_drugs: number | null;
  sm_tractable: boolean | null; ab_tractable: boolean | null; ensembl: string | null;
  genetic_evidence: GeneticEvidence;
  references: Reference[]; trials: Trial[]; omics_datasets: OmicsDataset[];
  counts: { references: number; trials: number; omics: number };
}
export interface StepStat {
  step_id: StepId; short: string; name: string; order: number; n: number;
  conf: Record<string, number>;
  evidence: { literature: number; trials: number; omics: number; genetic: number; druggable: number };
  types: Record<string, number>;
}
export interface TopMolecule {
  mol_id: string; name: string; gene_symbol: string | null; step: StepId; step_short: string;
  mol_type: string; n_references: number; n_trials: number; has_genetic: boolean; druggable: boolean | null;
}
export interface Stats {
  n_molecules: number;
  by_type: Record<string, number>;
  by_confidence: Record<string, number>;
  evidence_overall: Record<string, number>;
  steps: StepStat[];
  top_molecules: TopMolecule[];
}
export interface DiscRecord {
  mol_id: string; name: string; gene_symbol: string | null; mol_type: string; pathway_step: StepId;
  tier: string; disc_class: string;
  C_score: number | null; R_score: number | null; D_score: number | null; D_direction: string | null;
  A_score: number | null; E_score: number | null; spec_final: number | null; T1DI: number | null;
  n_pmids: number; D_finding: string | null; R_finding: string | null;
}
export interface Meta {
  title: string; n_molecules: number; n_steps: number;
  harvest_sources: Record<string, number>;
  evidence_totals: Record<string, number>;
  coverage_delta: Record<string, unknown>;
  step_counts: Record<string, number>;
}
