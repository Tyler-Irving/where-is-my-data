/**
 * Calculate relative luminance of a color (perceived brightness)
 * Returns value between 0 (darkest) and 1 (brightest)
 * Uses WCAG formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getColorBrightness(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Check if a color is considered "dark"
 * Threshold: 0.18 (colors below this are considered dark)
 */
export function isColorDark(hexColor: string): boolean {
  return getColorBrightness(hexColor) < 0.18;
}

/**
 * Lighten a hex color by a percentage
 * @param hexColor - Hex color string (with or without #)
 * @param percent - Percentage to lighten (0-100)
 */
export function lightenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const num = parseInt(hex, 16);
  
  const r = (num >> 16) + Math.round(2.55 * percent);
  const g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  const b = (num & 0x0000FF) + Math.round(2.55 * percent);
  
  const newR = Math.min(255, r);
  const newG = Math.min(255, g);
  const newB = Math.min(255, b);
  
  return '#' + (newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0');
}

/**
 * Get a display-friendly version of a color
 * If dark, lightens it for better visibility on dark backgrounds
 */
export function getDisplayColor(hexColor: string): string {
  if (isColorDark(hexColor)) {
    // Lighten dark colors by 50% for better visibility
    return lightenColor(hexColor, 50);
  }
  return hexColor;
}
