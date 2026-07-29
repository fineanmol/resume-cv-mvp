# Auto-apply API + MCP

Teal-style automation for [resume.fineanmol.dev](https://resume.fineanmol.dev/):

1. Tailor resume/CL content to a JD (Gemini, truth-bound)
2. Export PDF with the **same `buildPrintHtml` document** the website Download button prints

## Setup

```bash
cd /Users/fineanmol/Desktop/Site/resume-cv-mvp
npm install
npx playwright install chromium
export GEMINI_API_KEY=your_key
npm run api   # http://127.0.0.1:8791
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health |
| POST | `/v1/generate_for_job` | One-shot: tailor + export PDFs to `outputDir` |
| POST | `/v1/tailor_application` | Tailor only (returns JSON) |
| POST | `/v1/export_pdfs` | Export only (same print HTML as Download) |
| POST | `/v1/humanize_document` | Humanize pass |

## CLI

```bash
npm run generate -- \
  --job-id li_123 --company FACTUREE --role "Associate PM" \
  --jd-file ./jd.txt \
  --out /path/to/applications/jobs/li_123_facturee \
  --master-resume /path/to/sakshi-resume.json \
  --master-cover-letter /path/to/sakshi-cover-letter.json
```

## MCP

Tools: `generate_for_job`, `tailor_application`, `export_pdfs`.
