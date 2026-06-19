import { describe, it, expect } from 'vitest';
import { splitIntoBullets, cleanLeadingBullet } from '../utils/bullets';

describe('bullets utility', () => {
  describe('cleanLeadingBullet', () => {
    it('strips standard bullet characters', () => {
      expect(cleanLeadingBullet('• Led the team')).toBe('Led the team');
      expect(cleanLeadingBullet('● Mentored junior devs')).toBe('Mentored junior devs');
      expect(cleanLeadingBullet('▪ Managed databases')).toBe('Managed databases');
      expect(cleanLeadingBullet('- Designed API')).toBe('Designed API');
      expect(cleanLeadingBullet('* Tested UI')).toBe('Tested UI');
    });

    it('retains negative signs in numbers', () => {
      expect(cleanLeadingBullet('-5% latency')).toBe('-5% latency');
      expect(cleanLeadingBullet('-10x improvement')).toBe('-10x improvement');
    });

    it('does not strip normal words starting with characters', () => {
      expect(cleanLeadingBullet('Software Engineer')).toBe('Software Engineer');
    });
  });

  describe('splitIntoBullets', () => {
    it('splits by newlines', () => {
      const input = 'Bullet one\nBullet two\nBullet three';
      expect(splitIntoBullets(input)).toEqual(['Bullet one', 'Bullet two', 'Bullet three']);
    });

    it('splits by bullet symbols on a single line', () => {
      const input = '• Bullet one • Bullet two • Bullet three';
      expect(splitIntoBullets(input)).toEqual(['Bullet one', 'Bullet two', 'Bullet three']);
    });

    it('splits by space-dash-space', () => {
      const input = 'Bullet one - Bullet two - Bullet three';
      expect(splitIntoBullets(input)).toEqual(['Bullet one', 'Bullet two', 'Bullet three']);
    });

    it('handles mixed newlines and inline bullets', () => {
      const input = '• Bullet one\n• Bullet two • Bullet three\nBullet four';
      expect(splitIntoBullets(input)).toEqual([
        'Bullet one',
        'Bullet two',
        'Bullet three',
        'Bullet four'
      ]);
    });

    it('returns single item if no split markers found', () => {
      const input = 'This is a single normal sentence.';
      expect(splitIntoBullets(input)).toEqual(['This is a single normal sentence.']);
    });
  });
});
