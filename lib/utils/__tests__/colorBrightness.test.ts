import { describe, it, expect } from 'vitest';
import { getColorBrightness, isColorDark, lightenColor, getDisplayColor } from '../colorBrightness';

describe('getColorBrightness', () => {
  it('returns 0 for black', () => {
    expect(getColorBrightness('#000000')).toBe(0);
  });

  it('returns 1 for white', () => {
    expect(getColorBrightness('#ffffff')).toBe(1);
  });

  it('works without # prefix', () => {
    expect(getColorBrightness('000000')).toBe(0);
  });

  it('returns a mid-range value for gray', () => {
    const brightness = getColorBrightness('#808080');
    expect(brightness).toBeGreaterThan(0.2);
    expect(brightness).toBeLessThan(0.5);
  });
});

describe('isColorDark', () => {
  it('returns true for black', () => {
    expect(isColorDark('#000000')).toBe(true);
  });

  it('returns false for white', () => {
    expect(isColorDark('#ffffff')).toBe(false);
  });

  it('returns true for very dark blue', () => {
    expect(isColorDark('#0a0a2e')).toBe(true);
  });

  it('returns false for bright yellow', () => {
    expect(isColorDark('#ffff00')).toBe(false);
  });
});

describe('lightenColor', () => {
  it('lightens black by 50%', () => {
    const result = lightenColor('#000000', 50);
    expect(result).toBe('#7f7f7f');
  });

  it('clamps to white when over-lightening', () => {
    const result = lightenColor('#cccccc', 100);
    expect(result).toBe('#ffffff');
  });
});

describe('getDisplayColor', () => {
  it('returns the same color for bright colors', () => {
    expect(getDisplayColor('#ff9900')).toBe('#ff9900');
  });

  it('lightens dark colors', () => {
    const result = getDisplayColor('#000000');
    expect(result).not.toBe('#000000');
    // Should be lighter
    expect(getColorBrightness(result)).toBeGreaterThan(0);
  });
});
