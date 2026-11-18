export type PlanId = 'base' | 'medio' | 'pro';

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  monthlyCoins: number;
  tagline: string;
  perks: string[];
  highlight?: boolean;
};

export const TRIAL_DAYS = 5;
export const WELCOME_COINS = 1000;
export const REFERRAL_REWARD = 500;
export const REFERRAL_GOAL = 5;

export const PLANS: Plan[] = [
  {
    id: 'base',
    name: 'BASE',
    price: '4,99 €',
    monthlyCoins: 1000,
    tagline: 'Per iniziare a imparare',
    perks: ['1.000 SONAR COIN al mese', 'RADAR completo', '1 portafoglio demo', 'Lezioni base', 'Tornei tra amici'],
  },
  {
    id: 'medio',
    name: 'MEDIO',
    price: '9,99 €',
    monthlyCoins: 5000,
    tagline: 'Il più scelto',
    highlight: true,
    perks: [
      '5.000 SONAR COIN al mese',
      'RADAR completo',
      '3 portafogli demo',
      'Lezioni avanzate',
      'Crea i tuoi tornei',
      'Statistiche dettagliate',
      '1 skin al mese · zero pubblicità',
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '19,99 €',
    monthlyCoins: 20000,
    tagline: 'Per chi fa sul serio',
    perks: [
      '20.000 SONAR COIN al mese',
      'RADAR completo + avvisi istantanei',
      'Portafogli illimitati',
      'Tutte le lezioni e sfide esclusive',
      'Tornei privati',
      "Analisi IA dei tuoi errori",
      'Tutte le skin + esclusive PRO',
    ],
  },
];

export const COIN_PACKS = [
  { id: 'p1', coins: 1000, price: '0,99 €' },
  { id: 'p2', coins: 5500, price: '4,99 €', bonus: '+10%' },
  { id: 'p3', coins: 12000, price: '9,99 €', bonus: '+20%', best: true },
  { id: 'p4', coins: 65000, price: '49,99 €', bonus: '+30%' },
];

export const SKINS = [
  { id: 'aurora', name: 'Aurora', colors: ['#7CF5FF', '#7A5CFF', '#FF7AD9'], price: 2500 },
  { id: 'abyss', name: 'Abisso', colors: ['#021B3A', '#0A4D8C', '#3FD0FF'], price: 2500 },
  { id: 'ruby', name: 'Rubino', colors: ['#3A0010', '#C2133D', '#FF8BA7'], price: 4000 },
  { id: 'emerald', name: 'Smeraldo', colors: ['#002A1C', '#0FA36B', '#9FFFD6'], price: 4000 },
];
