import { describe, it, expect } from 'vitest';
import { formatMarkdownInline } from '../utils/markdown';

describe('formatMarkdownInline', () => {
  // ── bold ─────────────────────────────────────────────────────────────────
  it('converts **bold** to <strong>', () => {
    expect(formatMarkdownInline('Hello **world**')).toBe('Hello <strong>world</strong>');
  });

  it('converts multiple bold spans', () => {
    expect(formatMarkdownInline('**a** and **b**')).toBe('<strong>a</strong> and <strong>b</strong>');
  });

  // ── underline ─────────────────────────────────────────────────────────────
  it('converts __underline__ to <u>', () => {
    expect(formatMarkdownInline('__underline__')).toBe('<u>underline</u>');
  });

  it('does not confuse __underline__ with _italic_', () => {
    expect(formatMarkdownInline('__u__ and _i_')).toBe('<u>u</u> and <em>i</em>');
  });

  // ── strikethrough ─────────────────────────────────────────────────────────
  it('converts ~~strike~~ to <s>', () => {
    expect(formatMarkdownInline('~~removed~~')).toBe('<s>removed</s>');
  });

  // ── italic (* and _) ──────────────────────────────────────────────────────
  it('converts *italic* to <em>', () => {
    expect(formatMarkdownInline('*italic*')).toBe('<em>italic</em>');
  });

  it('converts _italic_ to <em>', () => {
    expect(formatMarkdownInline('_italic_')).toBe('<em>italic</em>');
  });

  it('does not convert ** bold ** as italic', () => {
    expect(formatMarkdownInline('**bold**')).toBe('<strong>bold</strong>');
  });

  // ── mixed markers ────────────────────────────────────────────────────────
  it('handles bold + italic on the same line', () => {
    expect(formatMarkdownInline('**bold** and *italic*')).toBe(
      '<strong>bold</strong> and <em>italic</em>'
    );
  });

  it('handles all four marker types together', () => {
    const result = formatMarkdownInline('**b** __u__ ~~s~~ *i*');
    expect(result).toBe('<strong>b</strong> <u>u</u> <s>s</s> <em>i</em>');
  });

  // ── HTML escaping ─────────────────────────────────────────────────────────
  it('HTML-escapes < and > before processing markers', () => {
    expect(formatMarkdownInline('<b>not a tag</b>')).toBe('&lt;b&gt;not a tag&lt;/b&gt;');
  });

  it('HTML-escapes & before processing markers', () => {
    expect(formatMarkdownInline('a & **b**')).toBe('a &amp; <strong>b</strong>');
  });

  // ── no markers ───────────────────────────────────────────────────────────
  it('returns plain text unchanged', () => {
    expect(formatMarkdownInline('No markers here')).toBe('No markers here');
  });

  it('returns empty string unchanged', () => {
    expect(formatMarkdownInline('')).toBe('');
  });
});
