# Rebuilt React-Tailwind CV & Cover Letter SaaS MVP

An enterprise-ready, modular, and premium Candidate CV & Cover Letter tailoring application. Rebuilt from the ground up utilizing React, TypeScript, and Tailwind CSS. It features Firebase cloud authentication and storage, IndexedDB / LocalStorage hybrid syncing, real-time Gemini AI document tailoring, interactive ATS keyword score widgets, and an advanced client-side vector PDF builder.

---

## 🚀 Premium Features

### 1. Unified Dashboard Workspace
- **Modern Landing Page**: High-converting visual showcase themed with custom palettes, scroll animations, and interactive live template renderers.
- **Unified Document Dashboard**: Complete control panel to list, search, preview, rename, and delete drafts safely.
- **Credential Auth Modal**: Smooth login/register overlay supporting dual authentication modes (Google Firebase Auth with Firestore, alongside a completely local mock offline environment for local testing).

### 2. Direct Preview A4 Sheet Editing
- **Wysiwyg ContentEditable**: Directly click and edit headers, contacts, bullet points, summaries, and paragraphs inline on the A4 page preview.
- **Smart Paragraphs**: In cover letters, paragraph templates contain placeholders like `{{company}}` and `{{role}}`. Modifying paragraphs directly preserves placeholders in the state unless they are edited, preventing static replacement leaks.
- **State-History Integration**: Edits automatically sync to local state `onBlur` (avoiding cursor caret jumps while typing) and integrate with the undo/redo stack (`Ctrl+Z` / `Cmd+Z` to undo direct text adjustments).

### 3. Visual Template Carousels
- **Horizontal Switchers**: Reusable sliding carousels positioned at the top of editing sidebars.
- **Live Miniatures**: Rather than simple skeletons, they render live scaled-down A4 miniature previews (`scale(0.11)`) populated with the user's actual document data. This allows users to inspect exactly how their own content looks in Navy Elegant, Harvard Serif, Creative Sidebar, or Tech Monospace at a glance before clicking to switch layouts.

### 4. Advanced PDF Downloader Engine
- **Tailwind v4 Patch**: Tailwind v4 uses computed `oklch()` and `oklab()` color spaces which crash standard `html2canvas` parser runs. We built a high-performance, single-pixel Canvas 2D color resolver that converts all computed oklch/oklab styles to browser-native `rgba()` color strings before generating the PDF.
- **Clean Print Output**: Unscaled document renders are appended to the DOM behind viewport bounds (`position: fixed; z-index: -9999`) to preserve layout DPI scaling, and shadows/borders are stripped dynamically to output vector A4 prints.

### 5. AI Tailoring & ATS Scoring Panel
- **Weighted Match Scoring**: Computes compatibility score based on Job Description keyword occurrences.
- **AI Keyword Injection**: Clicking a missing keyword tag initiates a focused Gemini AI query to naturally inject the keyword into the document, showing a loading spinner on the badge, and saving the state to the history stack (making it instantly undoable).
- **Link Scraper**: Extract Job Descriptions from listing links using a CORS proxy and fallback Gemini parsing.
- **AI Bullet improver**: Sentence-level suggestions to refine experience items on the fly.

---

## 📁 Codebase Architecture

The app is a React + TypeScript SPA under `src/`. For a full guide — editor layout, state flow, template system, duplication map, and the **planned modular component structure** — see:

**→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

### Quick map

```
src/
├── App.tsx                     # Editor shell, auth routing, three-panel layout
├── types/index.ts              # ResumeState, CoverLetterState, LayoutSettings
├── config/                     # defaultResume, defaultCL, fonts
├── hooks/                      # useUndoRedo, useAutoSave, useAiActions, …
├── services/                   # db, firebase, gemini, pdf
├── utils/                      # bullets, jdMatcher
├── components/                 # Forms, panels, modals (flat — refactor planned)
│   ├── ResumeForm.tsx          # Left panel — 8 resume sections
│   ├── CoverLetterForm.tsx     # Left panel — cover letter
│   ├── DesignPanel.tsx         # Right panel — design controls
│   ├── EditorHeader.tsx        # Toolbar, zoom, template/section modals
│   ├── TemplatesModal.tsx      # Template picker with live preview
│   ├── AddSectionModal.tsx     # Designer template — add section
│   ├── RearrangeSectionsModal.tsx
│   ├── JDPanel.tsx / ATSWidget.tsx
│   └── Dashboard, LandingPage, Auth, …
├── templates/
│   ├── ResumeTemplates.tsx     # 7 resume layouts (navy, serif, sidebar, tech, ats, executive, designer)
│   ├── CoverLetterTemplates.tsx
│   └── TemplateHeader.tsx      # Shared header (5 styles)
└── tests/                      # Vitest — templates, pdf, ats, auth, dashboard
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
npm install
```

### Local Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests
```bash
npm run test
```

### Compile & Build Production
```bash
npm run build
```
This runs the typescript compiler checks (`tsc`) and bundles the application via Vite.
