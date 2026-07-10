# Type 1 MI Pathway Atlas

A standalone Next.js app presenting a **de novo** molecular atlas of the Type 1
(atherothrombotic) myocardial-infarction pathway. Every molecule is placed within
the step of the atherothrombotic cascade where it acts, and each is clickable to an
evidence page listing its supporting literature, clinical trials, omics datasets,
human-genetic associations and druggability.

## Data

All data is static JSON under `public/data/`, produced by an independent harvest of
PubMed, GEO/PRIDE/ArrayExpress, ClinicalTrials.gov, Open Targets and the GWAS Catalog:

- `pathway.json` — the 8-step atherothrombotic cascade (+ systemic bucket)
- `molecules.json` — slim record per molecule for listing/search (~2k molecules)
- `evidence/<mol_id>.json` — full evidence bundle per molecule
- `meta.json` — harvest counts, evidence totals, coverage delta vs the prior catalog

## Run

```bash
# Node >= 20 required (Next 15)
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm start
```

## Routes

- `/` — pathway-organized landing view (molecules grouped by cascade step)
- `/dashboard` — interactive charts (recharts): step distribution (clickable), evidence coverage, molecule types, confidence
- `/table` — sortable, filterable data table of all molecules (click a row → evidence page)
- `/step/[stepId]` — every molecule in one cascade step
- `/molecule/[molId]` — per-molecule evidence page
- `/molecules` — searchable/filterable full catalog
- `/about` — methods, provenance, coverage delta, and summary figures

## Notes

Pathway-step assignment is an evidence-tagged inference (each molecule carries a
confidence indicator), not curated ground truth. This is a discovery-oriented map
for hypothesis generation, not a clinical decision tool.
