export const THEMES = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    color: '#00f3ff',
    border: 'border-neon-cyan',
    text: 'text-neon-cyan',
    glow: 'shadow-neon-cyan',
    bg: 'bg-cyan-950/40',
    badge: 'bg-cyan-950 text-neon-cyan border-neon-cyan/40',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Green',
    color: '#00ff66',
    border: 'border-neon-green',
    text: 'text-neon-green',
    glow: 'shadow-neon-green',
    bg: 'bg-emerald-950/40',
    badge: 'bg-emerald-950 text-neon-green border-neon-green/40',
  },
  synth: {
    id: 'synth',
    name: 'Synthwave',
    color: '#ff007f',
    border: 'border-neon-magenta',
    text: 'text-neon-magenta',
    glow: 'shadow-neon-magenta',
    bg: 'bg-rose-950/40',
    badge: 'bg-rose-950 text-neon-magenta border-neon-magenta/40',
  },
  stealth: {
    id: 'stealth',
    name: 'Stealth Amber',
    color: '#ffb700',
    border: 'border-amber-500',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    bg: 'bg-amber-950/40',
    badge: 'bg-amber-950 text-amber-400 border-amber-500/40',
  },
};

export function getThemeClasses(themeId = 'cyan') {
  return THEMES[themeId] || THEMES.cyan;
}
