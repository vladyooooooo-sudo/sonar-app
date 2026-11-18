/**
 * SONAR design tokens.
 * Two themes: "diamond" (white + diamond/ice, the default) and "gold" (black + gold, the inverse).
 */

export type ThemeName = 'diamond' | 'gold';

export type Palette = {
  name: ThemeName;
  dark: boolean;
  bg: string;
  bgGradient: readonly [string, string, ...string[]];
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textDim: string;
  textFaint: string;
  /** Solid brand color for icons, links, small accents. */
  accent: string;
  /** Logo / important highlights: the "gem" gradient. */
  gem: readonly [string, string, ...string[]];
  /** Primary buttons. */
  primary: readonly [string, string, ...string[]];
  onPrimary: string;
  /** Big hero cards (balance, radar). */
  hero: readonly [string, string, ...string[]];
  heroText: string;
  heroDim: string;
  heroGem: readonly [string, string, ...string[]];
  up: string;
  down: string;
  upSoft: string;
  downSoft: string;
  glow: string;
  tabBar: string;
};

export const palettes: Record<ThemeName, Palette> = {
  diamond: {
    name: 'diamond',
    dark: false,
    bg: '#F2F5FB',
    bgGradient: ['#FFFFFF', '#EEF3FB', '#E6EDF9'],
    surface: '#FFFFFF',
    surfaceAlt: '#F5F8FD',
    border: 'rgba(20, 34, 84, 0.08)',
    text: '#0B1230',
    textDim: '#5A6488',
    textFaint: '#9AA3C2',
    accent: '#3D7BFF',
    gem: ['#5AA9FF', '#8FD3FF', '#B6A6FF', '#6C8CFF'],
    primary: ['#18214D', '#0A0F2A'],
    onPrimary: '#FFFFFF',
    hero: ['#0B1230', '#17235A', '#1F2F78'],
    heroText: '#FFFFFF',
    heroDim: 'rgba(220, 232, 255, 0.66)',
    heroGem: ['#FFFFFF', '#CFEAFF', '#9FD4FF', '#D7CCFF', '#FFFFFF'],
    up: '#12B886',
    down: '#F0466A',
    upSoft: 'rgba(18, 184, 134, 0.12)',
    downSoft: 'rgba(240, 70, 106, 0.12)',
    glow: 'rgba(110, 170, 255, 0.45)',
    tabBar: '#FFFFFF',
  },
  gold: {
    name: 'gold',
    dark: true,
    bg: '#060608',
    bgGradient: ['#0E0C08', '#070708', '#040405'],
    surface: '#121216',
    surfaceAlt: '#1A1A20',
    border: 'rgba(255, 220, 150, 0.10)',
    text: '#F7F1E3',
    textDim: '#A79F8C',
    textFaint: '#6B6555',
    accent: '#E7C26B',
    gem: ['#FFF3C9', '#E9C46F', '#B8862E', '#F5D98A'],
    primary: ['#FFE9A8', '#E2B65A', '#B8862E'],
    onPrimary: '#140F04',
    hero: ['#1C160A', '#0F0C07', '#050505'],
    heroText: '#FFF8E6',
    heroDim: 'rgba(255, 236, 190, 0.6)',
    heroGem: ['#FFF7DA', '#F2D284', '#C9973C', '#FFE7A3'],
    up: '#3DDC97',
    down: '#FF5C7A',
    upSoft: 'rgba(61, 220, 151, 0.12)',
    downSoft: 'rgba(255, 92, 122, 0.12)',
    glow: 'rgba(231, 194, 107, 0.4)',
    tabBar: '#111014',
  },
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

export const font = {
  display: 'Sora_700Bold',
  displayHeavy: 'Sora_800ExtraBold',
  displaySemi: 'Sora_600SemiBold',
  body: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_800ExtraBold',
} as const;
