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

The project is structured under `src/` as a clean, production-ready React application:

```
src/
├── types/                # Strict TypeScript Type & Interface declarations
│   └── index.ts          # Common types (ResumeState, CoverLetterState, etc.)
├── config/               # Default document configs and layout presets
│   ├── defaultCL.ts      # Default cover letter profile (Jordan Carter)
│   └── defaultResume.ts  # Default resume profile (Jordan Carter)
├── hooks/                # Custom React hooks
│   ├── useUndoRedo.ts    # History-aware state tracking for undo/redo
│   └── useOnlineStatus.ts# Monitors online connectivity to disable AI blocks offline
├── services/             # Core services for database, AI, and exports
│   ├── firebase.ts       # Firebase SDK config & connection check
│   ├── db.ts             # Firestore DB and LocalStorage hybrid draft manager
│   ├── gemini.ts         # Gemini AI API request structure and html parser
│   └── pdf.ts            # pdf.js headshot extractor & html2pdf generator
├── templates/            # PDF layout template renderers
│   ├── ResumeTemplates.tsx     # Navy, Serif, Sidebar, and Tech resume layouts
│   └── CoverLetterTemplates.tsx# Navy, Serif, Sidebar, and Tech cover letter layouts
├── components/           # Reusable workspace components
│   ├── Auth.tsx          # Login/Signup forms with toggleable local mode
│   ├── Dashboard.tsx     # Workspace list and template picker triggers
│   ├── EditorHeader.tsx  # Zoom, save status, undo/redo, and PDF download buttons
│   ├── LandingPage.tsx   # Visual landing page and preview gallery
│   ├── TemplatePicker.tsx# Template selector modal with live mock A4 renders
│   ├── TemplateCarousel.tsx# Sidebar horizontal layout slider with live miniatures
│   ├── ResumeForm.tsx    # Resume sidebar fields (personal info, experience, etc.)
│   ├── CoverLetterForm.tsx# Cover Letter sidebar fields (drag-and-drop highlights)
│   ├── JDPanel.tsx       # Link scraper, text area, and ATS widget
│   └── ATSWidget.tsx     # Keyword score checker and AI keyword badge triggers
└── tests/                # Automated Vitest integration tests
    ├── pdf.test.tsx      # Tests PDF service and oklch/oklab color space conversion
    ├── templates.test.tsx# Tests edit-mode contentEditable renders and blur triggers
    ├── ats.test.tsx      # Tests keyword mapping and injection triggers
    ├── auth.test.tsx     # Tests local credentials toggle
    └── dashboard.test.tsx# Tests document creation and selector modals
```

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
