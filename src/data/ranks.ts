/**
 * SONAR Ranked. The rating (SR) moves with the % return of each closed demo trade,
 * never with the amount of SONAR COIN: buying coins cannot buy a rank.
 */

export type TierId = 'bronzo' | 'argento' | 'oro' | 'platino' | 'diamante' | 'leggenda';

export type Tier = {
  id: TierId;
  name: string;
  title: string;
  min: number;
  colors: [string, string, string];
  glow: string;
};

export const START_SR = 1000;

export const TIERS: Tier[] = [
  { id: 'bronzo', name: 'Bronzo', title: 'Investitore dilettante', min: 0, colors: ['#F3C09A', '#B8733F', '#6E3B17'], glow: 'rgba(205,127,50,0.55)' },
  { id: 'argento', name: 'Argento', title: 'Investitore medio-basso', min: 1100, colors: ['#FFFFFF', '#C3CBD9', '#7D8799'], glow: 'rgba(200,210,230,0.6)' },
  { id: 'oro', name: 'Oro', title: 'Investitore medio', min: 1250, colors: ['#FFF3C4', '#F2C14E', '#A8740F'], glow: 'rgba(242,193,78,0.6)' },
  { id: 'platino', name: 'Platino', title: 'Investitore esperto', min: 1450, colors: ['#E9FFFB', '#7FE3D3', '#22897D'], glow: 'rgba(127,227,211,0.6)' },
  { id: 'diamante', name: 'Diamante', title: 'Investitore avanzato', min: 1700, colors: ['#FFFFFF', '#9FD4FF', '#7A6CFF'], glow: 'rgba(159,212,255,0.7)' },
  { id: 'leggenda', name: 'Leggenda', title: 'Maestro dei mercati', min: 2000, colors: ['#FFE6F6', '#FF6FB5', '#7A1FD1'], glow: 'rgba(255,111,181,0.65)' },
];

/** Rating change for one closed trade, from its % return (fees included). */
export function srDelta(pnlPct: number, amount: number) {
  if (amount < 50) return 0; // micro trades don't count
  const raw = Math.round(pnlPct * 25);
  return Math.max(-35, Math.min(45, raw));
}

export function tierOf(sr: number): Tier {
  let t = TIERS[0];
  for (const x of TIERS) if (sr >= x.min) t = x;
  return t;
}

export function nextTier(sr: number): Tier | null {
  return TIERS.find((x) => x.min > sr) ?? null;
}

/** 0..1 progress inside the current tier. */
export function tierProgress(sr: number) {
  const t = tierOf(sr);
  const n = nextTier(sr);
  if (!n) return 1;
  return (sr - t.min) / (n.min - t.min);
}

/** Example leaderboard until accounts exist. */
export const SAMPLE_LEADERBOARD = [
  { name: 'Giulia_R', sr: 2140 },
  { name: 'marco.trade', sr: 1985 },
  { name: 'Ale99', sr: 1810 },
  { name: 'SaraInvest', sr: 1620 },
  { name: 'Fede_btc', sr: 1475 },
  { name: 'Luca', sr: 1330 },
  { name: 'Chiara.M', sr: 1190 },
  { name: 'nico_s', sr: 1040 },
];
