# Classic Résumé Workspace — local pilot

Start with `npm ci` and `npm run studio`, then open http://127.0.0.1:5175/.
The old `/studio` URL now opens the same classic application; it is no longer a separate editor.

## Workflow

1. Choose a profile in the classic dashboard. Anmol is seeded. Master profiles imports/exports versioned JSON and creates blank candidates. ChatGPT/Claude can prepare this JSON; no direct account connection is claimed.
2. Create a résumé and a cover letter. Each starts with the selected candidate's facts, not another candidate's sample data. Edit with the existing forms, on-canvas controls, design panel, icons and links. Education now also supports evidence links.
3. In each editor, use **Publish automation version**. Choose a label, page budget, and whether summary/bullets (résumé) or paragraphs (letter) may be rewritten. This stores an immutable snapshot. Later draft edits never update it. Select any older published version to roll back automation.
4. In **Applications & automation**, choose explicit résumé and letter versions, paste a JD, and generate. Both PDFs are saved as a separate draft application. Review changes, facts, page-count warnings and actual PDFs. Editing an application creates a separate classic-editor copy; its prior exported PDFs remain immutable. Publish the edited copy as a new version if desired.
5. Mark reviewed only after checking the output. The app never submits job applications.

## AI setup and limits

Controlled AI mode supports OpenAI (Responses API), Anthropic (Messages API), and Gemini (generateContent). Choose the provider and exact model in Applications. Load the account's model catalog or enter an exact text-model ID. Catalog availability is not proof of endpoint compatibility; unsupported models fail without a silent fallback. No fixed list is labelled “latest.”

For automation, configure `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` on the server. Applications also accepts a temporary key held in memory while the panel is open, never in document JSON or browser storage. Requests include provider/model; do not put API keys in workflow items, prompts or MCP arguments. AI generation sends published documents and the JD to that provider and may incur API charges. Live paid generation and account model discovery remain unverified; adapter tests use mocked responses.

The original manual editor/PDF-import Gemini integration is a separate legacy path and still stores its key in browser storage. Its settings panel says so explicitly. Unifying those tools and migrating existing stored keys to a secure credential manager remains a release blocker.

Official adapter references: [OpenAI Responses](https://developers.openai.com/api/docs/guides/text), [OpenAI model listing](https://platform.openai.com/docs/api-reference/models/list), [Claude Messages](https://platform.claude.com/docs/en/api/messages/create), [Claude model listing](https://platform.claude.com/docs/en/api/models/list), [Gemini model listing](https://ai.google.dev/api/models).

## Design and publication corrections — 4 October 2026

Hybrid is now a distinct renderer based on the original Hybrid PDF, not an alias for Designer. New documents retain master skill categories. Hybrid supports form editing, section rearrangement, grouped skills, colors and typography. It does not yet have Designer's inline canvas editing/dragging parity. New Designer documents start with the existing reset preset. Existing drafts and locked versions are not silently reset or migrated.

Publishing in the UI now renders an exact PDF first, displays its page count, requires a review checkbox and blocks a selected page-budget overrun. The server checks the reviewed state hash before locking, so changes after preview require a new preview. Version history exposes labels, IDs, permissions and reviewed PDFs for new versions. Older versions remain available and need a new reviewed version to pick up changes. Publication freezes data/settings, not the renderer binary; renderer-version pinning for byte-identical future regeneration remains a release blocker.

Print margins repeat on each A4 page (minimum 10 mm). Preview boundary calculations include safe spacing and allow oversized entries to flow. The editor remains an approximate live canvas; the actual PDF is authoritative. Passing text-retention tests does not prove every arbitrary page transition looks good.

Only summary, existing role bullets and cover-letter paragraphs can be applied from AI output. Identity, employers, dates, skill lists, qualifications, links, layout and highlight elements are copied from the published versions. Numeric changes and changed role/bullet counts are rejected. This is a guardrail, not a proof that prose is factual: every application remains a draft needing human review. Without the key, preserve mode fills company/role tokens and keeps prose; it is not AI tailoring.

The classic editor's original Gemini controls remain available for manual editing. Automated versioned generation is accessed through Applications, n8n or the new MCP interface.

## Storage and compatibility

- Candidate masters: `data/studio/profiles`.
- Immutable publications, applications and PDFs: `data/studio/workspace/<profileId>`.
- Classic editing drafts: profile-scoped browser storage. Export/back up important documents; clearing browser storage removes editing drafts, not server publications. Local profiles never silently sync to Firebase.
- Legacy documents are available separately in the profile selector, using the old storage keys. They are not reassigned or overwritten by migration.
- Original desktop project and Sakshi n8n workflow were not modified. The previous v1 API/MCP remain separate compatibility paths.
- Local profiles are organizational boundaries, not authenticated tenants. Do not expose this beta or its loopback API to the public internet.

## MCP

Run `node scripts/mcp-launch.mjs` from an MCP client using stdio. The launcher resolves the project directory itself. Tools: list_profiles, read_profile, list_publications, list_applications, validate_document, generate_draft_application, validate_templates, read_validation_report.

The website/API must be running. Generation requires explicit published version UUIDs. MCP cannot inspect visual appearance by itself: validate_templates renders 45 synthetic cases, and read_validation_report reads the separate PDF text/geometry check. Browser and rendered-page visual inspection remain necessary.

## n8n

Import `n8n/workspace-application.workflow.json` as a separate inactive workflow. In the input node, paste profile/version IDs from the website's n8n request panel. Configure Header Auth (`Authorization: Bearer <your secret>`) on all three HTTP nodes. Set the same random secret (32+ characters) in `N8N_BRIDGE_TOKEN` and run `npm run studio:n8n-bridge`.

The authenticated bridge exposes generation and PDF download only; it cannot modify masters or publish versions. Docker Desktop uses host.docker.internal:8794. Both PDF branches produce binaries for your chosen storage step. No existing workflow is activated or changed. Live n8n execution has not been verified in this pilot because Docker/n8n is not running.

## Validation

- `npm run build` — TypeScript + production bundle.
- `npm test` — component, storage and rewrite-boundary tests.
- `npm run test:mcp` — real stdio handshake/tool calls.
- `npm run test:templates` — all eight résumé and seven letter templates, three content sizes each. Oversized résumé fixtures include an entry larger than one page.
- Run `scripts/check-pdf-matrix.py` with a Python environment containing pdfplumber and Pillow plus Poppler on PATH. Checks text retention, blank pages and out-of-page characters; renders visual contact sheets. Results live under work/template-validation.

Page budgets are warnings, not content deletion rules. Export never truncates prose or silently shrinks the font to meet a page limit. A two-page budget is a maximum preference, not a request to add a blank page to a short document.

## Before a paid hosted release

Authentication, tenant authorization, encrypted provider credentials, quota/billing, recovery/backups, accessibility/keyboard audit and production deployment remain future work. npm reported 20 dependency vulnerabilities at installation (8 moderate, 12 high); resolve and re-audit before public deployment. PDF smoke checks and unit tests do not guarantee every arbitrary input, ATS parser or browser combination.
