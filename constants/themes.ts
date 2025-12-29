export const THEMES = {
  coffee: {
    name: 'Coffee',
    bg: 'bg-[#F5F1E8]',
    text: 'text-[#4A3B32]',
    panel: 'bg-[#EBE5CE]',
    border: 'border-[#D4C5A9]',
    input: 'bg-[#F5F1E8]',
    accent: 'text-[#8C6B5D]',
    button: 'bg-[#8C6B5D] hover:bg-[#7A5A4C] text-white',
    previewBg: 'bg-[#FAF7F0]',
    previewText: 'text-[#5C4B41]',
    // Extended properties for consistency
    card: 'bg-[#FAF7F0] border border-[#D4C5A9] rounded-xl shadow-sm',
    cardFlat: 'bg-[#F5F1E8] border border-[#D4C5A9]/50 rounded-lg',
    appbar: 'bg-[#EBE5CE] border-b border-[#D4C5A9]',
    chip: 'bg-[#FAF7F0] border border-[#D4C5A9] rounded-full',
    divider: 'border-[#D4C5A9]/50',
  }
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeKey];
