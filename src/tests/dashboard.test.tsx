import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import { dbService } from '../services/db';

vi.mock('../services/db', () => ({
  dbService: {
    listDrafts: vi.fn(),
    renameDraft: vi.fn(),
    deleteDraft: vi.fn()
  }
}));

describe('Dashboard Workspace and Draft actions', () => {
  const mockDrafts = [
    { id: 'resume_1', type: 'resume' as const, title: 'Sakshi Resume', updatedAt: Date.now() },
    { id: 'cl_1', type: 'coverletter' as const, title: 'Google PM Letter', updatedAt: Date.now() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dbService.listDrafts).mockResolvedValue(mockDrafts);
  });

  it('lists resume and cover letter drafts with correct titles', async () => {
    const mockSelect = vi.fn();
    const mockCreate = vi.fn();
    const mockLogout = vi.fn();

    render(
      <Dashboard
        userId="test@example.com"
        isLocal={true}
        onSelectDocument={mockSelect}
        onCreateNew={mockCreate}
        onLogout={mockLogout}
      />
    );

    // Wait for drafts list to render
    await waitFor(() => {
      expect(screen.getByText('Sakshi Resume')).toBeInTheDocument();
      expect(screen.getByText('Google PM Letter')).toBeInTheDocument();
    });
  });

  it('triggers TemplatePicker when clicking new document buttons', async () => {
    const mockSelect = vi.fn();
    const mockCreate = vi.fn();
    const mockLogout = vi.fn();

    render(
      <Dashboard
        userId="test@example.com"
        isLocal={true}
        onSelectDocument={mockSelect}
        onCreateNew={mockCreate}
        onLogout={mockLogout}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sakshi Resume')).toBeInTheDocument();
    });

    const newResumeBtn = screen.getByRole('button', { name: /New Resume/i });
    fireEvent.click(newResumeBtn);

    // Template picker should be visible
    expect(screen.getByText(/Select Resume Layout/i)).toBeInTheDocument();
    
    // Choose Navy Elegant
    const navyOption = screen.getByText('Navy Elegant');
    fireEvent.click(navyOption);

    expect(mockCreate).toHaveBeenCalledWith('resume', 'navy');
  });

  it('triggers RenameModal and deletes draft through ConfirmModal', async () => {
    const mockSelect = vi.fn();
    const mockCreate = vi.fn();
    const mockLogout = vi.fn();

    vi.mocked(dbService.renameDraft).mockResolvedValue(undefined);
    vi.mocked(dbService.deleteDraft).mockResolvedValue(undefined);

    render(
      <Dashboard
        userId="test@example.com"
        isLocal={true}
        onSelectDocument={mockSelect}
        onCreateNew={mockCreate}
        onLogout={mockLogout}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Google PM Letter')).toBeInTheDocument();
    });

    // Test Rename Button
    const renameBtns = screen.getAllByTitle('Rename draft');
    expect(renameBtns.length).toBeGreaterThan(0);
    fireEvent.click(renameBtns[0]); // Click rename on the first card (Google PM Letter / Sakshi Resume)

    expect(screen.getByText(/Enter New Draft Title/i)).toBeInTheDocument();
    const inputField = screen.getByPlaceholderText(/e.g. My Tailored Software Resume/i);
    fireEvent.change(inputField, { target: { value: 'Renamed Title' } });
    
    const saveBtn = screen.getByRole('button', { name: /Save Title/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(dbService.renameDraft).toHaveBeenCalled();
    });

    // Test Delete Button
    const deleteBtns = screen.getAllByTitle('Delete draft');
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByText(/Delete Document Draft/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(dbService.deleteDraft).toHaveBeenCalled();
    });
  });
});
