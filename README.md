# CoronaryAtlas

### 🌐 Live site: **[coronaryatlas.com](https://coronaryatlas.com)**

[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee.svg)](LICENSE)
[![Data: CC BY-NC 4.0](https://img.shields.io/badge/Data-CC%20BY--NC%204.0-6366f1.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Open source](https://img.shields.io/badge/Open%20source-yes-2ea44f.svg)](#license)

**CoronaryAtlas** — a standalone, de novo molecular atlas of the **Type I (atherothrombotic) myocardial
infarction** pathway, with an interactive Next.js frontend for exploring biomarkers,
Type-I-vs-non-Type-I discrimination scoring, diagnostic utility, and assay feasibility.

The project is **open source**: the application and backend code are MIT-licensed, and the
curated dataset is released under CC BY-NC 4.0. It is deployed at
**[coronaryatlas.com](https://coronaryatlas.com)** via AWS Amplify (auto-build on push to `main`).

## What's here

- **`pathway-atlas/`** — the Next.js 15 application (React 19, Tailwind v4, Recharts).
  Static-exportable; every molecule, pathway step, and analytics view is prerendered.
- **`denovo_data/`** — the underlying datasets and methodology:
  - `molecules_catalog_full` — 1,969 canonical molecules placed in a 9-step cascade,
    each with mechanism, provenance (PMIDs / trials / omics / genetics), and druggability.
  - `discrimination/` — the Type-I-vs-non-Type-I discrimination scoring (5 evidence-anchored
    scores + composite T1DI), diagnostic-performance axes, assay-feasibility profiles,
    dashboard analytics, and methodology reports.
- **`contact-backend/`** — an AWS Lambda (Node 20) that verifies the site's Cloudflare
  Turnstile token server-side and emails contact-form submissions via Amazon SES. The
  static site cannot call SES directly, so this is the small server hop it POSTs to.

## The catalog in brief

1,969 molecules harvested de novo from PubMed (2,645 articles), ClinicalTrials.gov
(974 trials), Open Targets (177 genes), the GWAS Catalog (209 genes), and omics
repositories — normalized, deduplicated, and assigned to a pathway step:

| Step | Molecules |
|---|---|
| Lipid retention & oxidation | 256 |
| Inflammation | 473 |
| Plaque rupture / erosion | 79 |
| Endothelial | 135 |
| Platelet | 231 |
| Thromboxane | 15 |
| Coagulation | 91 |
| Myocardial injury | 254 |
| Systemic / off-pathway | 435 |

## Provenance & timeline

**Both projects below were created for the Anthropic *Built with Claude: Life Sciences* Hackathon, and both were started _after_ the hackathon was launched.** Exact creation timestamps are taken from the projects' git histories so there is no ambiguity:

| Project | Repository | First commit | Status |
|---|---|---|---|
| Earlier, abandoned attempt | [t1t2-biomarker-miner](https://github.com/singamnv/t1t2-biomarker-miner) | **Tue, Jul 7, 2026 — 2:38 PM EDT** (6:38 PM UTC) | Abandoned the same day (last commit 8:51 PM EDT) |
| **This project — CoronaryAtlas** | [t1-mi-pathway-atlas](https://github.com/singamnv/t1-mi-pathway-atlas) | **Thu, Jul 9, 2026 — 9:42 PM EDT** (Fri, Jul 10, 1:42 AM UTC) | Active |

The earlier 260-molecule catalog referenced in the atlas is **not prior work by others** — it was our own first attempt during the same hackathon, built roughly two days before this project. It was abandoned because its approach was not converging on the right answer, so this project was restarted from scratch with a clean de novo harvest. Any comparison against that earlier catalog is an internal sanity check against our own discarded draft, not a reuse of external prior art.

## Scoring framework

The comparator is **Type I vs non-Type I MI**, taking non-Type-I as the full Fourth
Universal Definition (UDMI-4) set rather than Type 2 alone. Each candidate is scored
against a **12-axis non-Type-I panel**:

| UDMI subtype | Axes | Tier-1 molecules scored |
|---|---|---|
| Type 2 (supply–demand mismatch) | sepsis (197), hypoxemia (179), peri-operative stress (171), tachyarrhythmia (160), hypovolemia (127), hypertensive emergency (125), anemia (72) | 7 axes, 72–197 each |
| Type 3 (sudden cardiac death) | sudden cardiac death | 173 / 325 (53.2%) |
| Type 4a (PCI-related) | PCI-related periprocedural | 140 / 325 (43.1%) |
| Type 4b (stent thrombosis) | stent thrombosis | 65 / 325 (20.0%) |
| Type 4c (in-stent restenosis) | in-stent restenosis | 177 / 325 (54.5%) |
| Type 5 (CABG-related) | CABG-related | 185 / 325 (56.9%) |

299 of 325 Tier-1 molecules carry at least one axis call, up from 270 on the old 7-axis panel.

Alongside this, each candidate is scored for plaque-rupture responsiveness (R), direct
Type-I-vs-non-Type-I differential (D), assay feasibility (A) and evidence strength (E),
combined into the composite **T1DI**.

Three properties of this framework are worth stating plainly:

- **Coverage is uneven, and the gaps are real.** Stent thrombosis (4b) is the thinnest new axis
  at 20.0%; 81 of the 177 restenosis (4c) calls rest on animal neointimal-hyperplasia models
  rather than human data; and many of the 173 sudden-death (3) calls come only from post-mortem
  biochemistry, which is confounded by post-mortem redistribution and is not equivalent to an
  ante-mortem measurement. A 28-record audit reverted spurious magnitude-0 calls that came from
  baseline-predictor studies rather than measured change; 183 further predictor-only findings with
  magnitude ≥1 were left in place and are recorded as a known upper bound on C inflation.
- **Type 4b penalises atherothrombotic markers, by design.** Stent thrombosis shares Type I's
  mechanism, so a platelet or coagulation marker that rises in 4b is failing to separate Type I
  from a non-Type-I subtype. That penalty is captured faithfully rather than corrected away.
- **Direct head-to-head evidence remains scarce and is Type-2-only.** 16 of 325 Tier-1
  molecules (4.9%) have any direct Type-I-vs-non-Type-I comparison, 6 of them flagged weak.
  Every one compares against Type 2; no marker in this atlas has a published head-to-head
  level comparison against Type 3, 4a, 4b, 4c or 5.

No values are invented — absent evidence is flagged, never imputed, and a magnitude of 0
("studied in this setting, did not move") is kept distinct from "nobody looked".

## Running the app

```bash
cd pathway-atlas
npm install
npm run build
npm start        # or: npm run dev
```

Requires Node >= 20.9. Open the **Dashboard** tab for the interactive analytics
(signature map, linked cross-filter, discrimination leaderboard) and the
**T1 vs non-T1** / **Diagnostic** tabs for the per-marker scoring.

## License

CoronaryAtlas is **open source** under a dual license:

- **Code** (the `pathway-atlas/` app and `contact-backend/`) — [MIT License](LICENSE).
  Free to use, modify, and redistribute, including commercially, with attribution.
- **Data** (the curated catalog and scores in `denovo_data/`) —
  [Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).
  Share and adapt for **non-commercial** research and education, with attribution to CoronaryAtlas.

The underlying public sources (PubMed/PMC, GEO, PRIDE, ArrayExpress, ClinicalTrials.gov,
Open Targets, GWAS Catalog) each carry their own terms, which continue to apply to their records.

## Author

**Narayana Sarma V. Singam, MD, FACC** — cardiologist and biomedical engineer
(ML/AI). [sarmasingam.com](https://sarmasingam.com) ·
[LinkedIn](https://www.linkedin.com/in/singamnv) · [X](https://x.com/singamnv)

---

*Research and informational use only. Biomarker scores are derived from abstract-level
literature mining and are not validated for clinical decision-making.*
