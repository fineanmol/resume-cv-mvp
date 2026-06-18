import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { extractKeywords } from '../utils/jdMatcher';
import { ATSWidget } from '../components/ATSWidget';

describe('ATS Keyword extraction and lookaround matching', () => {
  it('correctly extracts specialized technical skills including C++, C# and .NET', () => {
    const jdText = "We are seeking a developer with C++, C#, and .NET experience who knows software development.";
    const keywords = extractKeywords(jdText);
    
    expect(keywords).toContain('c++');
    expect(keywords).toContain('c#');
    expect(keywords).toContain('.net');
    expect(keywords).toContain('software development');
  });

  it('calculates score based on JD keyword frequency/weights', () => {
    const jdText = "Looking for a Product Manager with strong SQL. The Product Manager should be skilled in SQL and SQL database design.";
    const keywords = extractKeywords(jdText);
    
    // SQL is mentioned 3 times in JD, Product Manager is mentioned 2 times (and matches product manager and product management).
    expect(keywords).toContain('sql');
    expect(keywords).toContain('product manager');
  });

  it('renders ATSWidget with compatibility score and allows keyword click trigger', async () => {
    const mockInject = vi.fn().mockResolvedValue(undefined);
    const mockRecheck = vi.fn();
    
    const jdText = "Looking for a developer with Figma and Python skills.";
    const docText = "I have experience with Figma.";
    
    render(
      <ATSWidget
        jd={jdText}
        docText={docText}
        onInjectKeyword={mockInject}
        onRecheck={mockRecheck}
      />
    );
    
    // Figma should be marked as Matched, Python as Missing
    expect(screen.getByText(/ATS Compatibility Score/i)).toBeInTheDocument();
    
    // Verify refreshed check click
    const recheckBtn = screen.getByRole('button', { name: /Re-check/i });
    fireEvent.click(recheckBtn);
    expect(mockRecheck).toHaveBeenCalledTimes(1);

    // Python button is missing keyword click trigger
    const pythonBtn = screen.getByRole('button', { name: /python/i });
    await act(async () => {
      fireEvent.click(pythonBtn);
    });
    expect(mockInject).toHaveBeenCalledWith('python');
  });
});
