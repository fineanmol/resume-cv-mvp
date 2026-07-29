/** Print-specific CSS injected into the iframe `<style>` block inside `downloadPdf`. */
export function getPrintStyleBlock(): string {
  return `
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Block layout (not flex-center): centering leaves L/R gutters in Playwright PDF. */
    body {
      display: block !important;
      justify-content: unset !important;
    }

    .pdf-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      height: auto !important;         /* let content determine height across pages */
      min-height: auto !important;
      width: 210mm !important;
      max-width: 210mm !important;
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Strip the gray placeholder background — only needed in editor */
    .group\\/avatar > div,
    [class*="bg-slate-100"] {
      background-color: transparent !important;
      box-shadow: none !important;
    }

    /* Preserve border-radius clipping ONLY for the avatar/photo container.
     * Applying overflow:hidden to .rounded globally would make every SectionWrapper
     * (which also uses the "rounded" class) non-breakable, causing whole sections
     * to jump to the next page instead of breaking between individual entries.
     * Do NOT use border-radius: inherit — it zeroes out Tailwind rounded-full. */
    .group\\/avatar > div,
    .group\\/avatar img {
      overflow: hidden !important;
    }

    /* Ensure the photo image fills its container */
    .group\\/avatar img {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }

    /* Strip all editor decoration */
    .pdf-sheet::before,
    .pdf-sheet::after {
      display: none !important;
      content: none !important;
    }

    /* Hide animation on wave/frame lines */
    .photo-wave-dash,
    .photo-wave-dash-slow,
    .photo-frame-dash {
      animation: none !important;
    }

    /* Force backgrounds to print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* margin: 0 prevents Chrome from printing its built-in date/title/URL/page-number
     * headers & footers — those only render when there is non-zero @page margin space. */
    @page { size: A4; margin: 0; }

    /* ── Page-break management ─────────────────────────────────
     * The designer two-column grid is converted to float layout in the JS clone
     * preparation above. Floated blocks fragment correctly across print pages.
     * We just need to ensure the columns and their children allow fragmentation.
     * ──────────────────────────────────────────────────────────── */

    /* Float columns: allow fragmentation and ensure block layout */
    .designer-column {
      break-inside: auto !important;
      page-break-inside: auto !important;
      overflow: visible !important;
      display: block !important;
      min-height: 0 !important;
    }
    .designer-column > .group\\/draggable,
    .designer-column section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    /* Header: stay with the first row of content below it */
    header {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
      padding-bottom: 4px !important;
      margin-bottom: 4px !important;
    }
    header .mt-2 {
      margin-top: 4px !important;
    }
    [data-testid="designer-column-grid"] {
      margin-top: 4px !important;
    }

    .group\\/draggable {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    .group\\/section {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    section h3, h3 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    .group\\/item,
    .relative.group\\/item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    ul > li {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /*
     * Force entry containers to block layout in print.
     * Chrome refuses to fragment a flex container whose children all have
     * break-inside:avoid — it treats the whole flex box as one unbreakable unit
     * and pushes the entire section to the next page.
     * Switching to display:block restores per-entry fragmentation.
     */
    section > div.flex,
    section > ul.flex,
    .designer-column section > div.flex,
    .designer-column section > ul.flex {
      display: block !important;
    }
    /* Skills grid must stay flex-wrap (override section > div.flex display:block). */
    section > div.flex[data-skills-grid],
    .designer-column section > div.flex[data-skills-grid],
    section [data-skills-grid] {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: flex-start !important;
      column-gap: 17.8pt !important;
      row-gap: 8.5pt !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    [data-skill-grid-item] {
      max-width: 100%;
      flex: 0 0 auto !important;
    }
    /* Restore entry gap after flex→block; keep moderately tight for 1-page fit */
    section > div:not(.grid) > .group\\/item + .group\\/item,
    section > ul > li + li {
      margin-top: var(--entry-gap, 8px);
    }
    /* Education: dashed rule (Masters ↔ Bachelors) matches Experience; don't double-stack gap */
    section [data-education-entries] {
      display: block !important;
    }
    section [data-education-entries] > .group\\/item:has(.border-dashed) + .group\\/item {
      margin-top: 0 !important;
    }
    /* Center dashed job/cert separators: equal space above & below the rule */
    section .border-dashed.border-b {
      padding-bottom: 3.5pt !important;
      margin-bottom: 3.5pt !important;
    }
    /* Education Masters↔Bachelors: match golden Sakshi Product Resume (~79pt title span) */
    section [data-education-entries] [data-edu-separator='true'] {
      padding-bottom: 5.5pt !important;
      margin-bottom: 6pt !important;
    }
    /* When a dashed rule already has margin-bottom, don't double-stack entry gap */
    section > div:not(.grid) > .group\\/item:has(.border-dashed) + .group\\/item {
      margin-top: 0 !important;
    }
    section > ul > .group\\/item + .group\\/item {
      margin-top: calc(var(--entry-gap, 8px) - 4px);
    }
    .designer-column > .group\\/draggable:not(:last-child) {
      margin-bottom: var(--section-gap, 8px);
    }
  `;
}

/** html2canvas legacy export overrides injected in downloadPdfLegacy onclone. */
export function getLegacyExportStyleBlock(): string {
  return `
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
              .pdf-sheet.pdf-export,
              .pdf-export {
                min-height: auto !important;
                box-shadow: none !important;
              }
              .pdf-export::before,
              .pdf-export::after,
              .pdf-sheet.pdf-export::before,
              .pdf-sheet.pdf-export::after {
                display: none !important;
                content: none !important;
              }
              .pdf-export header {
                margin-top: 0 !important;
              }
              .pdf-export .pdf-keep,
              .pdf-export .group\\/logo {
                align-self: flex-start !important;
                flex-shrink: 0 !important;
              }
              * {
                font-variant-ligatures: none !important;
                text-rendering: optimizeLegibility !important;
              }
              .pdf-sheet::before, .pdf-sheet::after {
                display: none !important;
                content: none !important;
              }
              [contenteditable="true"] {
                outline: none !important;
                border-color: transparent !important;
                background-color: transparent !important;
              }
              [class*="group/draggable"] {
                border: none !important;
                background: transparent !important;
                background-color: transparent !important;
                box-shadow: none !important;
              }
              .designer-column {
                border: none !important;
                background: transparent !important;
                background-color: transparent !important;
              }
              .group\\/section,
              .group\\/item,
              .section-active,
              .item-active,
              .header-active {
                opacity: 1 !important;
                filter: none !important;
                background: transparent !important;
                background-color: transparent !important;
                border-color: transparent !important;
                box-shadow: none !important;
              }
              .photo-frame-dash,
              .photo-wave-dash,
              .photo-wave-dash-slow {
                animation: none !important;
                transform: none !important;
              }
              .profile-photo-waves {
                opacity: 0.5 !important;
              }
              .pdf-sheet img {
                display: inline-block !important;
                vertical-align: middle !important;
                height: auto !important;
                max-height: none !important;
              }
              .pdf-sheet svg.lucide,
              .pdf-sheet svg:not(.profile-photo-frame):not(.profile-photo-waves) {
                display: inline-block !important;
                vertical-align: middle !important;
                flex-shrink: 0 !important;
              }
              .pdf-sheet span.inline-flex.items-center,
              .pdf-sheet .inline-flex.items-center,
              .pdf-sheet .flex.items-start.gap-2,
              .pdf-sheet .flex.items-center.gap-1\\.5,
              .pdf-sheet .flex.items-center.gap-1,
              .pdf-sheet .flex.items-center.gap-2 {
                flex-direction: row !important;
                align-content: center !important;
              }
              .pdf-sheet span.inline-flex.items-center,
              .pdf-sheet .inline-flex.items-center,
              .pdf-sheet .flex.items-center.gap-1\\.5,
              .pdf-sheet .flex.items-center.gap-1,
              .pdf-sheet .flex.items-center.gap-2,
              .pdf-sheet header .flex.flex-wrap {
                align-items: center !important;
              }
              .pdf-sheet li.flex.gap-2,
              .pdf-sheet li.flex.gap-2\\.5,
              .pdf-sheet .flex.items-start.gap-2 {
                align-items: flex-start !important;
              }
              .pdf-sheet span.inline-flex.items-center > svg,
              .pdf-sheet span.inline-flex.items-center > img,
              .pdf-sheet li.flex > svg,
              .pdf-sheet li.flex > img,
              .pdf-sheet li.flex > span > svg,
              .pdf-sheet .flex.items-center > svg,
              .pdf-sheet .flex.items-start > span > svg,
              .pdf-sheet .flex.items-start > span > img {
                display: inline-block !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                vertical-align: middle !important;
              }
              .pdf-sheet .flex.flex-wrap.items-center.gap-1\\.5 {
                gap: 6px !important;
                row-gap: 6px !important;
                column-gap: 6px !important;
                align-items: center !important;
                align-content: flex-start !important;
              }
              .pdf-sheet .flex.flex-wrap.items-center.gap-1\\.5 > span,
              .pdf-sheet [data-skill-chip] {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-sizing: border-box !important;
                vertical-align: middle !important;
                line-height: 1.375 !important;
                white-space: nowrap !important;
              }
              .pdf-sheet header .flex.flex-wrap {
                align-items: center !important;
                row-gap: 6px !important;
                column-gap: 16px !important;
              }
              .pdf-sheet .pdf-keep {
                visibility: visible !important;
                opacity: 1 !important;
              }
            `;
}
