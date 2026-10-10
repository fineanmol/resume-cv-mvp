# Profile Resume Studio — local beta

Run `npm ci`, then `npm run studio`. Open http://127.0.0.1:5175/studio.
On macOS the launcher uses installed Google Chrome for PDF generation. Else install the Playwright browser with `npx playwright install chromium`.

The new API listens on 127.0.0.1:8793. The existing `npm run api` /v1 server is independent. No desktop workflow or Sakshi master is migrated or rewritten. This local beta is not a hosted multi-tenant service.

## Profiles and generation

Create a profile in the UI, or import a JSON file. Existing ResumeState JSON is accepted and converted to the new versioned profile format. `/api/v2/schema` returns an example and instructions for profile creation with any assistant. ChatGPT/Claude integration in this version is JSON/prompt exchange, not account linking.

Profiles live in `data/studio/profiles`. Generated variants, PDFs and metadata live in `data/studio/jobs`. Set PROFILE_DATA_DIR to use a different directory. Keep this directory private and backed up. Master edits never rewrite saved variants.

POST /api/v2/generate with `{ "profileId": "anmol", "jobDescription": "...", "company": "...", "role": "...", "template": "hybrid" }`.

The engine ranks existing skills and bullet points against recognized JD terms without rewriting facts. No paid AI service is called. Identical inputs reuse the cached application. The score is recognized keyword coverage, not an employer ATS prediction. Missing terms are reported, never inserted automatically. A coverage value of null means no terms were recognized. Company and role are application metadata, not fabricated employment claims.

Template versions other than Hybrid, Designer and ATS are experimental. The exporter supports all eight templates, but long content can span multiple A4 pages. Always inspect the final PDF. No hidden text or automatic font shrinking is used.

## Docker n8n

The original workflow remains unchanged. Import `n8n/profile-resume.workflow.json` as a separate, inactive workflow.

1. Run the studio.
2. Generate a random secret of at least 32 characters and set `N8N_BRIDGE_TOKEN` in your shell. Run `npm run studio:n8n-bridge`.
3. The bridge listens on port 8794 and exposes only generation and artifact downloads. It requires Bearer authorization; it does not expose profile editing.
4. In n8n create a Header Auth credential: header `Authorization`, value `Bearer YOUR_SECRET`. Select it in both HTTP nodes.
5. Edit the Profile and job node or replace it with your existing JD source. Each user/profile uses its own profileId.
6. Test manually. Download PDF produces the resume binary for a subsequent storage or application-pack step. No automatic application submission is included.

Docker Desktop calls `http://host.docker.internal:8794`. Native n8n can use the same bridge at `http://127.0.0.1:8794`. Do not expose the local studio or unauthenticated API to the internet.

## Scope and next release

Included: persistent independent profiles, Anmol seed, structured identity/experience/skills editing, JSON import/export, original-inspired Hybrid template, shared print renderer, JD ranking, reusable API and n8n workflow.

Not yet included: provider-backed prose rewriting, ChatGPT/Claude account connections, hosted authentication/tenant isolation, billing, remote MCP, or migration/certification of Sakshi's live automation. Existing desktop installations and data remain the rollback baseline.

Anmol's testing coverage metric is deliberately omitted until the original Vitest/90% claim and newer Jest/98% claim are reconciled. The 50+ issues award belongs to Shaadi.com. Internship and full-time Infosys dates remain separate.
