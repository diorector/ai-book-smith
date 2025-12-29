export const THEMES = {
  midnight: {
    name: 'Midnight',
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    panel: 'bg-slate-800',
    border: 'border-slate-700',
    input: 'bg-slate-800 text-slate-100',
    accent: 'text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    previewBg: 'bg-white',
    previewText: 'text-slate-900'
  },
  paper: {
    name: 'Paper',
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    panel: 'bg-white',
    border: 'border-stone-300',
    input: 'bg-stone-50',
    accent: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-500',
    previewBg: 'bg-white',
    previewText: 'text-stone-900'
  },
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
    previewText: 'text-[#5C4B41]'
  },
  deepSpace: {
    name: 'Deep Space',
    bg: 'bg-black',
    text: 'text-gray-200',
    panel: 'bg-gray-900',
    border: 'border-gray-800',
    input: 'bg-gray-900 text-gray-200',
    accent: 'text-cyan-400',
    button: 'bg-cyan-700 hover:bg-cyan-600 text-white',
    previewBg: 'bg-gray-100',
    previewText: 'text-black'
  }
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeKey];

