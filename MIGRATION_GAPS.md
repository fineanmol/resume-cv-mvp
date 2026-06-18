# Migration Gaps & Feature Comparison (Vanilla JS vs. React-Tailwind)

This document outlines the differences, improvements, and minor architectural gaps between the original Vanilla TypeScript implementation (`cover-letter-editor`) and the rebuilt React-Tailwind SaaS MVP (`resume-cv-mvp`).

---

## 📊 Summary of Feature Differences

| Feature | Vanilla TypeScript Version | React-Tailwind SaaS MVP | Status / Gap Details |
| :--- | :--- | :--- | :--- |
| **Workspace Architecture** | Separated pages (`index.html` and `resume.html`) | Unified dashboard workspace with dynamic tab navigation | **Major Upgrade**: Single-page-app experience. |
| **Auth / Data Persistence** | LocalStorage only | Firebase Cloud Auth/Firestore + LocalStorage fallback | **Major Upgrade**: Production-ready auth database. |
| **Layout Templates** | 3 options (Navy, Serif, Sidebar) | 4 options (Navy, Harvard Serif, Sidebar, Tech Monospace) | **Major Upgrade**: Added Tech Monospace layout. |
| **Sidebar Switcher** | Dropdown option in accordion | Premium horizontal `TemplateCarousel` with live miniatures | **Major Upgrade**: Live previews of actual data. |
| **Direct A4 Editing** | Contenteditable with real-time sync | Contenteditable with `onBlur` state sync | **Trade-off**: `onBlur` prevents cursor jumps during typing. |
| **Caret Position Restoration** | Active cursor offset tracking on sync | None (focus leaves sheet on blur) | **Minor Gap**: Caret is not restored on Undo/Redo mid-sentence. |
| **PDF Scraper (PDF.js)** | Extracts text & headshot | Extracts text & headshot | **Fully Migrated**: Identical client-side parser. |
| **PDF Downloader** | `html2pdf.js` via CDN | `html2pdf.js` NPM package + `oklch/oklab` canvas resolver | **Major Upgrade**: Fixed color space compiler crashes. |
| **AI Polisher / Improver** | Inline "✨ Improve" buttons | Inline "✨ Improve" buttons | **Fully Migrated**: Prominently styled. |
| **ATS Score / Badges** | Weighted match + AI injection | Weighted match + AI injection | **Fully Migrated**: ATS score is fully interactive. |
| **Drag & Drop Reordering** | HTML5 drag-and-drop | HTML5 drag-and-drop | **Fully Migrated**: Sidebar reordering works. |
| **JD Listing Scraper** | 3 CORS proxies fallback | 3 CORS proxies fallback | **Fully Migrated**: Scraper is active. |

---

## 🔍 Detailed Review of Gaps

### 1. Caret Position & Focus Restoration on Undo/Redo
- **Vanilla JS**: Tracked character offsets inside the contenteditable preview divs. If an Undo/Redo action was triggered, it restored focus and placed the caret cursor at the exact character offset.
- **React-Tailwind**: Updates are synced to the React state strictly `onBlur` (when clicking away). While this eliminates cursor reset bugs while typing, triggering an Undo/Redo (via keyboard shortcuts) does not restore the caret cursor to a specific text node inside the A4 canvas.
- *Status*: Accepted trade-off. Direct editing is stable and doesn't suffer from cursor jump bugs, while standard sidebar forms are available for heavy text input.

### 2. Job Description Scraper Proxy Limits
- **Both Versions**: Rely on free CORS proxies (`allorigins.win`, `corsproxy.io`, `codetabs.com`). These proxies can occasionally hit rate limits or get blocked by Cloudflare screens on LinkedIn/Indeed.
- *Status*: Future roadmap feature to hook up a dedicated backend scraping worker or rotating proxy list. Copy-pasting text manually is supported as a reliable fallback.
