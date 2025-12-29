export const THEMES = {
  editorial: {
    name: 'Editorial',
    // Background
    bg: 'bg-[#fafaf8]',
    // Text
    text: 'text-[#1a1a1a]',
    textMuted: 'text-[#6b6b6b]',
    textFaint: 'text-[#999999]',
    // Panels & Cards
    panel: 'bg-[#f5f5f2]',
    card: 'bg-[#fafaf8] border border-[#e8e6e1] rounded',
    cardFlat: 'bg-[#f5f5f2] border border-[#e8e6e1] rounded',
    // Borders
    border: 'border-[#e8e6e1]',
    borderStrong: 'border-[#d4d2cc]',
    // Inputs
    input: 'bg-[#fafaf8]',
    // Accent
    accent: 'text-[#c41e3a]',
    accentBg: 'bg-[#c41e3a]',
    // Buttons
    button: 'bg-[#1a1a1a] hover:bg-[#3d3d3d] text-white',
    buttonSecondary: 'bg-[#fafaf8] hover:bg-[#e8e6e1] text-[#1a1a1a] border border-[#d4d2cc]',
    buttonGhost: 'hover:bg-[#e8e6e1] text-[#6b6b6b] hover:text-[#1a1a1a]',
    // Preview
    previewBg: 'bg-white',
    previewText: 'text-[#1a1a1a]',
    // Appbar
    appbar: 'bg-[#fafaf8] border-b border-[#e8e6e1]',
    // Chip
    chip: 'bg-[#e8e6e1] text-[#6b6b6b] rounded-sm',
    chipActive: 'bg-[#1a1a1a] text-white rounded-sm',
    // Divider
    divider: 'border-[#e8e6e1]',
  }
} as const;

// Default theme alias
export const THEMES_COMPAT = {
  coffee: THEMES.editorial,
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeKey];

// Helper to get theme (with fallback)
export function getTheme(key: string): Theme {
  return THEMES[key as ThemeKey] || THEMES.editorial;
}
