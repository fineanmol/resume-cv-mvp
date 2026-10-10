# Resume/Cover Letter Workspace

A local-first React and TypeScript workspace for building editable resumes and cover letters, maintaining reusable profiles, tailoring applications to job descriptions, and exporting recruiter-ready PDFs. The current product path is the unified Studio/classic workspace; the older v1 API remains available only for compatibility with existing automation.

The project is a local beta, not yet a hosted multi-tenant SaaS. See [STUDIO.md](STUDIO.md) and [WORKSPACE.md](WORKSPACE.md) for the authoritative product and operations documentation.

---

## 🚀 Premium Features

### 1. Unified Studio Workspace
- **Modern Landing Page**: High-converting visual showcase themed with custom palettes, scroll animations, and interactive live template renderers.
- **Unified Document Dashboard**: Complete control panel to list, search, preview, rename, and delete drafts safely.
- **Reusable profiles**: Keep independent candidate masters, publications, applications, and generated artifacts locally.
- **Classic workspace**: The `/` and `/studio` routes use the same editor and share the same template and section behavior.

### 2. Direct Preview A4 Sheet Editing
- **Wysiwyg ContentEditable**: Directly click and edit headers, contacts, bullet points, summaries, and paragraphs inline on the A4 page preview.
- **Smart Paragraphs**: In cover letters, paragraph templates contain placeholders like `{{company}}` and `{{role}}`. Modifying paragraphs directly preserves placeholders in the state unless they are edited, preventing static replacement leaks.
- **State-History Integration**: Edits automatically sync to local state `onBlur` (avoiding cursor caret jumps while typing) and integrate with the undo/redo stack (`Ctrl+Z` / `Cmd+Z` to undo direct text adjustments).

### 3. Visual Template Carousels and controls
- **Horizontal Switchers**: Reusable sliding carousels positioned at the top of editing sidebars.
- **Live Miniatures**: Previews are populated with the user's document data across ATS, Designer, Hybrid, Navy, Serif, Sidebar, Tech, and Executive layouts.
- **Shared section controls**: Layout, visibility, ordering, icons, links, bullets, skills, and extra fields use centralized behavior across templates.

### 4. PDF Export (browser print — not html2canvas)

**Do not switch back to html2canvas / html2pdf for resume download.** That path re-renders the DOM into a canvas and breaks flex layout, SVG icons, skill chips, and Tailwind v4 `oklch()` colors.

We use the same approach as Resume.io, Zety, Novoresume, and most resume SaaS products:

1. Clone the live `.pdf-sheet` from the preview (strip `.edit-only` and `contenteditable`)
2. Inject all page styles + Google Fonts into a hidden iframe
3. Call `iframe.contentWindow.print()` — the **browser’s own print engine** renders what you see
4. User chooses **Save as PDF** in the print dialog

**Why this works:** WYSIWYG — the print engine is the same one that paints the preview. No oklch conversion hacks, no icon misalignment, no distorted chips.

**Where it lives:** `src/services/pdf.ts` → `PdfService.downloadPdf()`. Print CSS: `src/index.css` (`@media print`). Legacy html2canvas code remains as `downloadPdfLegacy()` for reference only — do not wire it to the UI.

**Full decision record:** [docs/ARCHITECTURE.md — PDF export](docs/ARCHITECTURE.md#pdf-export)

### 5. Applications, AI providers, and ATS scoring
- **Weighted Match Scoring**: Computes compatibility score based on Job Description keyword occurrences.
- **Provider choice**: Applications can use OpenAI, Anthropic, or Gemini with an explicitly selected model. Provider keys are supplied through environment variables or a temporary in-memory UI key.
- **Versioned generation**: AI tailoring operates on published document versions; the master profile is not silently overwritten.
- **Link Scraper**: Extract Job Descriptions from listing links using a CORS proxy and fallback Gemini parsing.
- **AI Bullet improver**: Sentence-level suggestions to refine experience items on the fly.

---

## 📁 Codebase Architecture

The app is a React + TypeScript SPA under `src/`. For the editor layout, state flow, template system, workspace lifecycle, and validation plan, see:

**→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

### Quick map

```
src/
├── App.tsx                     # Classic editor shell and route selection
├── types/index.ts              # ResumeState, CoverLetterState, LayoutSettings
├── config/                     # defaultResume, defaultCL, fonts
├── hooks/                      # useUndoRedo, useAutoSave, useAiActions, …
├── services/                   # storage, providers, workspace, PDF, AI adapters
├── utils/                      # bullets, jdMatcher
├── components/                 # Forms, panels, profile/publication controls
│   ├── ResumeForm.tsx          # Structured resume section editing
│   ├── CoverLetterForm.tsx     # Left panel — cover letter
│   ├── DesignPanel.tsx         # Right panel — design controls
│   ├── EditorHeader.tsx        # Toolbar, zoom, template/section modals
│   ├── ProfileManager.tsx / PublicationBar.tsx
│   ├── AutomationPanel.tsx / ProviderChoice.tsx
│   └── design/                 # shared section and skills controls
├── templates/
│   ├── ResumeTemplates.tsx     # ATS, Designer, Hybrid, Navy, Serif, Sidebar, Tech, Executive
│   ├── CoverLetterTemplates.tsx
│   └── TemplateHeader.tsx      # Shared header (5 styles)
└── tests/                      # Vitest — templates, PDF, workspace, providers, parity
```

### Editor at a glance

| Panel | Component | Purpose |
|-------|-----------|---------|
| Left | `ResumeForm` / `CoverLetterForm` | Structured field editing |
| Centre | `ResumeTemplateRenderer` | Live A4 preview (WYSIWYG `contentEditable`) |
| Right | `DesignPanel` / `JDPanel` | Typography, colours, ATS & AI |

---

## 🛠️ Get Started

### Install Dependencies
```bash
npm ci
```

### Run the current application
```bash
npm run studio
```
Open [http://127.0.0.1:5175/studio](http://127.0.0.1:5175/studio). This starts the Vite application and the workspace API on port `8793`; PDF export starts its internal print renderer automatically. On machines without Google Chrome, install Playwright Chromium once with `npx playwright install chromium`.

Profiles and generated artifacts are stored under `data/studio` by default. Set `PROFILE_DATA_DIR` to move that data elsewhere.

### Run the production build locally

Build the frontend and serve it together with the workspace API from one origin:

```bash
npm run build
HOST=127.0.0.1 PORT=8780 PUBLIC_ORIGIN=http://127.0.0.1:8780 npm start
```

Open [http://127.0.0.1:8780](http://127.0.0.1:8780). For a real deployment, set `HOST=0.0.0.0`, choose the platform's `PORT`, set `PUBLIC_ORIGIN` to the public HTTPS origin, and persist `PROFILE_DATA_DIR`. The production server intentionally does not enable wildcard origins by default.

### Run Tests
```bash
npm run test
```

### Compile & Build Production
```bash
npm run build
```
This runs the typescript compiler checks (`tsc`) and bundles the application via Vite.

### AI keys (optional)

AI is not required for editing, templates, local profile storage, PDF export, or preserve-mode JD matching. Configure only the provider you use:

```bash
export OPENAI_API_KEY=...
export ANTHROPIC_API_KEY=...
export GEMINI_API_KEY=...
```

### MCP and n8n (optional)

With Studio running, launch the workspace MCP server from an MCP client:

```bash
node scripts/mcp-launch.mjs
```

For n8n, set a 32+ character `N8N_BRIDGE_TOKEN`, run `npm run studio:n8n-bridge`, and import an inactive workflow from `n8n/`. Docker n8n reaches the bridge at `http://host.docker.internal:8794`. The original Sakshi workflow is not replaced or activated by these files.

See [STUDIO.md](STUDIO.md), [WORKSPACE.md](WORKSPACE.md), and [docs/API_MCP.md](docs/API_MCP.md) for API contracts, publication rules, validation, and compatibility details.

### Legacy compatibility commands

The older v1 API/MCP path remains separate for existing automation:

```bash
npm run api    # http://127.0.0.1:8791
npm run mcp    # legacy MCP over stdio
```

Do not use this path for the new profile/workspace application flow.
