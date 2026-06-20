import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { Suspense } from 'react';
import { ResumeForm } from '../components/ResumeForm';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';

const noop = () => {};
const asyncNoop = async () => {};

function renderForm() {
  return render(
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeForm
        state={DEFAULT_RESUME_STATE}
        onChange={noop as never}
        onCommit={noop}
        onImproveBullet={asyncNoop}
        aiLoading={false}
        isOnline={true}
        geminiKey=""
      />
    </Suspense>
  );
}

describe('ResumeForm — smoke tests', () => {
  it('renders the Contact Details accordion section header', async () => {
    await act(async () => {
      renderForm();
    });
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
  });

  it('renders all main section header buttons', async () => {
    await act(async () => {
      renderForm();
    });

    // These are the actual labels used by each AccordionSection in the form
    expect(screen.getByRole('button', { name: /contact details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile summary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skills/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /work history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /education/i })).toBeInTheDocument();
  });

  it('clicking Work History section header opens it and shows experience entries', async () => {
    await act(async () => {
      renderForm();
    });

    const workHistoryBtn = screen.getByRole('button', { name: /work history/i });
    await act(async () => {
      fireEvent.click(workHistoryBtn);
    });

    // After opening, the company name input from DEFAULT_RESUME_STATE should appear
    expect(screen.getByDisplayValue('TechFlow Solutions')).toBeInTheDocument();
  });
});
