import { render, waitFor, type RenderResult } from '@testing-library/react';
import { ResumeTemplateRenderer, type ResumeTemplateProps } from '../../templates/ResumeTemplates';

/** Renders resume template and waits for lazy-loaded variant (Suspense). */
export async function renderResumeTemplate(
  props: ResumeTemplateProps
): Promise<RenderResult> {
  const result = render(<ResumeTemplateRenderer {...props} />);
  await waitFor(
    () => {
      if (!result.container.querySelector('.pdf-sheet')) {
        throw new Error('Lazy resume template did not render .pdf-sheet');
      }
    },
    { timeout: 5000 }
  );
  return result;
}
