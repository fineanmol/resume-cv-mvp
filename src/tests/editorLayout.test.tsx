import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { createRef, Suspense } from 'react';
import { EditorLayout } from '../components/layout/EditorLayout';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';
import { DEFAULT_CL_STATE } from '../config/defaultCL';
import type { EditorLayoutProps } from '../components/layout/EditorLayout';

const noop = () => {};
const asyncNoop = async () => {};

function buildProps(overrides: Partial<EditorLayoutProps> = {}): EditorLayoutProps {
  return {
    doc: {
      isResume: true,
      resumeState: DEFAULT_RESUME_STATE,
      resumeSet: noop as never,
      resumeCommitHistory: noop,
      clState: DEFAULT_CL_STATE,
      clSet: noop as never,
      clCommitHistory: noop,
    },
    mutations: {
      resumeMutations: {} as never,
      clMutations: {} as never,
    },
    panel: {
      sidebarOpen: true,
      zoomScale: 1,
      rightTab: 'design',
      setRightTab: noop,
      rightPanelOpen: false,
      setRightPanelOpen: noop as never,
    },
    sheet: {
      sheetRef: createRef<HTMLDivElement | null>() as React.RefObject<HTMLDivElement | null>,
      sheetOverflow: false,
      designFocusSection: null,
      onDesignFocusHandled: noop,
      showSettings: false,
    },
    aiConfig: {
      geminiKey: '',
      onGeminiKeyChange: noop,
      onSaveGeminiKey: noop as never,
      isOnline: true,
      aiLoading: false,
    },
    aiActions: {
      onImproveBullet: asyncNoop,
      jobDescription: '',
      onJdChange: noop,
      docText: '',
      onInjectKeyword: asyncNoop,
      onAiTailor: noop,
    },
    ...overrides,
  };
}

describe('EditorLayout — smoke tests', () => {
  it('renders without crashing with minimal props', async () => {
    const props = buildProps();
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading…</div>}>
          <EditorLayout {...props} />
        </Suspense>
      );
    });
    // The layout wrapper is present in the DOM
    expect(document.body.firstChild).not.toBeNull();
  });

  it('renders the resume form sidebar when isResume=true and sidebarOpen=true', async () => {
    const props = buildProps({ doc: { ...buildProps().doc, isResume: true } });
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading…</div>}>
          <EditorLayout {...props} />
        </Suspense>
      );
    });
    // ContactSection renders "Contact Details" in the sidebar
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
  });

  it('renders the cover letter form when isResume=false', async () => {
    const props = buildProps({
      doc: { ...buildProps().doc, isResume: false },
    });
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading…</div>}>
          <EditorLayout {...props} />
        </Suspense>
      );
    });
    // CoverLetterForm renders something different than the resume form
    expect(screen.queryByText('Contact Details')).toBeNull();
  });
});
