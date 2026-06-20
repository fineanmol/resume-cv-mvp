import { describe, it, expect } from 'vitest';
import { cleanJson } from '../services/gemini';

describe('cleanJson — markdown fence stripping', () => {
  it('strips ```json ... ``` fences', () => {
    const input = '```json\n{"key":"value"}\n```';
    const result = cleanJson(input);
    expect(result).toBe('{"key":"value"}');
  });

  it('strips plain ``` ... ``` fences (without json language tag)', () => {
    const input = '```\n{"key":"value"}\n```';
    const result = cleanJson(input);
    expect(result).toBe('{"key":"value"}');
  });

  it('passes through already-clean JSON unchanged', () => {
    const input = '{"name":"Alice","age":30}';
    expect(cleanJson(input)).toBe(input);
  });

  it('trims surrounding whitespace', () => {
    const input = '  \n  {"x":1}  \n  ';
    expect(cleanJson(input)).toBe('{"x":1}');
  });

  it('handles multi-line JSON objects inside fences', () => {
    const input = '```json\n{\n  "a": 1,\n  "b": 2\n}\n```';
    const result = cleanJson(input);
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('returns empty string when given only a code fence', () => {
    const input = '```json\n```';
    const result = cleanJson(input);
    expect(result).toBe('');
  });
});
