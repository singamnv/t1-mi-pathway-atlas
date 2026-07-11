# CoronaryAtlas

### 🌐 Live site: **[coronaryatlas.com](https://coronaryatlas.com)**

[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee.svg)](LICENSE)
[![Data: CC BY-NC 4.0](https://img.shields.io/badge/Data-CC%20BY--NC%204.0-6366f1.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Open source](https://img.shields.io/badge/Open%20source-yes-2ea44f.svg)](#license)

**CoronaryAtlas** — a standalone, de novo molecular atlas of the **Type I (atherothrombotic) myocardial
infarction** pathway, with an interactive Next.js frontend for exploring biomarkers,
Type-I-vs-Type-II discrimination scoring, diagnostic utility, and assay feasibility.

The project is **open source**: the application and backend code are MIT-licensed, and the
curated dataset is released under CC BY-NC 4.0. It is deployed at
**[coronaryatlas.com](https://coronaryatlas.com)** via AWS Amplify (auto-build on push to `main`).

## What's here

- **`pathway-atlas/`** — the Next.js 15 application (React 19, Tailwind v4, Recharts).
  Static-exportable; every molecule, pathway step, and analytics view is prerendered.
- **`denovo_data/`** — the underlying datasets and methodology:
  - `molecules_catalog_full` — 1,969 canonical molecules placed in a 9-step cascade,
    each with mechanism, provenance (PMIDs / trials / omics / genetics), and druggability.
  - `discrimination/` — the Type-I-vs-Type-II discrimination scoring (5 evidence-anchored
    scores + composite T1DI), diagnostic-performance axes, assay-feasibility profiles,
    dashboard analytics, and methodology reports.
- **`contact-backend/`** — an AWS Lambda (Node 20) that verifies the site's Cloudflare
  Turnstile token server-side and emails contact-form submissions via Amazon SES. The
  static site cannot call SES directly, so this is the small server hop it POSTs to.

## The catalog in brief

1,969 molecules harvested de novo from PubMed (2,716 articles), ClinicalTrials.gov
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

## Scoring framework

Each candidate is scored against a **7-driver Type-II confounder panel** (sepsis, anemia,
hypovolemia, tachyarrhythmia, hypoxemia, hypertensive emergency, high-demand stress) and
for plaque-rupture responsiveness, direct T1-vs-T2 differential, assay feasibility, and
evidence strength. See `denovo_data/discrimination/METHODOLOGY_REPORT.md` and
`DIAGNOSTIC_UTILITY_FRAMEWORK.md`. No values are invented — absent evidence is flagged,
never imputed.

## Running the app

```bash
cd pathway-atlas
npm install
npm run build
npm start        # or: npm run dev
```

Requires Node >= 20.9. Open the **Dashboard** tab for the interactive analytics
(signature map, linked cross-filter, discrimination leaderboard) and the
**Discrimination** / **Diagnostic** tabs for the per-marker scoring.

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
