export type Palette = {
  bg: string;
  shLight: string;
  shDark: string;
  navy: string; // primary text
  text2: string; // muted
  accent: string;
  accent2: string;
  accentGlow: string;
  track: string;
  ink: string;
  inkText: string;
  ok: string;
  scrim: string;
  divider: string;
  barFrom: string;
  barTo: string;
};

export const light: Palette = {
  bg: '#E6EEF7',
  shLight: 'rgba(255,255,255,0.9)',
  shDark: 'rgba(140,165,200,0.45)',
  navy: '#0B3D91',
  text2: '#7488A6',
  accent: '#FF6A2B',
  accent2: '#FFA05C',
  accentGlow: 'rgba(255,106,43,0.45)',
  track: '#DCE5F0',
  ink: '#12203F',
  inkText: '#FFFFFF',
  ok: '#1FA971',
  scrim: 'rgba(20,40,80,0.28)',
  divider: 'rgba(140,165,200,0.25)',
  barFrom: '#6C93E8',
  barTo: '#0B3D91',
};

export const dark: Palette = {
  bg: '#1C2230',
  shLight: 'rgba(255,255,255,0.055)',
  shDark: 'rgba(6,9,16,0.65)',
  navy: '#9DB8FF',
  text2: '#8795B0',
  accent: '#FF7A3D',
  accent2: '#FFB27A',
  accentGlow: 'rgba(255,122,61,0.5)',
  track: '#161B27',
  ink: '#EEF2FF',
  inkText: '#12203F',
  ok: '#3CD497',
  scrim: 'rgba(4,6,12,0.55)',
  divider: 'rgba(140,165,200,0.25)',
  barFrom: '#6C93E8',
  barTo: '#9DB8FF',
};

export const gradients = {
  /** ring arc: x1,y1 -> x2,y2 = 0,0 -> 1,1 */
  ring: ['#FFB27A', '#FF5A1F'] as const,
  flame: ['#FF5A1F', '#FFC107'] as const,
  avatar: ['#FFA05C', '#FF6A2B', '#E8451A'] as const,
};

export const radii = { card: 28, tile: 26, sheet: 32, icon: 16, bubble: 15, pill: 99, input: 20 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, gutter: 16, cardPad: 18, gap: 18 } as const;

export const MAX_WIDTH = 420;
