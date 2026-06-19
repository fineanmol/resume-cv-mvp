import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignPanel } from '../components/DesignPanel';
import { DEFAULT_RESUME_STATE } from '../config/defaultResume';

const layout = DEFAULT_RESUME_STATE.layoutSettings;

const openSection = (label: string) => {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(label, 'i') }));
};

describe('DesignPanel — spacing sliders emit layout patches', () => {
  it('Font Size slider calls onChange with fontSize', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    openSection('Spacing');
    fireEvent.change(screen.getByRole('slider', { name: 'Font Size' }), { target: { value: '12' } });
    expect(onChange).toHaveBeenCalledWith({ fontSize: 12 });
  });

  it('Line Height slider calls onChange with lineHeight', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    openSection('Spacing');
    fireEvent.change(screen.getByRole('slider', { name: 'Line Height' }), { target: { value: '1.55' } });
    expect(onChange).toHaveBeenCalledWith({ lineHeight: 1.55 });
  });

  it('Section Gap slider calls onChange with sectionSpacing', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    openSection('Spacing');
    fireEvent.change(screen.getByRole('slider', { name: 'Section Gap' }), { target: { value: '18' } });
    expect(onChange).toHaveBeenCalledWith({ sectionSpacing: 18 });
  });

  it('Column Gap slider appears only for designer template and emits columnGap', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DesignPanel layout={{ ...layout, template: 'navy' }} onChange={onChange} docType="resume" />
    );
    openSection('Spacing');
    expect(screen.queryByRole('slider', { name: 'Column Gap' })).toBeNull();

    rerender(
      <DesignPanel layout={{ ...layout, template: 'designer', columnGap: 16 }} onChange={onChange} docType="resume" />
    );
    // Spacing stays open across rerender — do not toggle again
    fireEvent.change(screen.getByRole('slider', { name: 'Column Gap' }), { target: { value: '24' } });
    expect(onChange).toHaveBeenCalledWith({ columnGap: 24 });
  });
});

describe('DesignPanel — template and style controls', () => {
  it('template picker calls onChange with template id', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    fireEvent.click(screen.getByText('Modern Designer'));
    expect(onChange).toHaveBeenCalledWith({ template: 'designer' });
  });

  it('header style picker calls onChange with headerStyle', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    openSection('Header Style');
    fireEvent.click(screen.getByText('Full Banner'));
    expect(onChange).toHaveBeenCalledWith({ headerStyle: 'banner' });
  });

  it('skills style chips calls onChange with skillsStyle', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    openSection('Skills Style');
    fireEvent.click(screen.getByText('Normal Text'));
    expect(onChange).toHaveBeenCalledWith({ skillsStyle: 'normal' });
  });

  it('layout outlines toggle calls onChange with showLayoutBounds', () => {
    const onChange = vi.fn();
    render(<DesignPanel layout={layout} onChange={onChange} docType="resume" />);
    openSection('Layout Outlines');
    fireEvent.click(screen.getByRole('switch', { name: /show layout outlines/i }));
    expect(onChange).toHaveBeenCalledWith({ showLayoutBounds: true });
  });
});
