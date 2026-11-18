import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { COSTS, kindOf } from '@/data/assets';
import { REFERRAL_REWARD, TRIAL_DAYS, WELCOME_COINS, type PlanId } from '@/data/plans';
import type { ThemeName } from '@/theme/tokens';

/**
 * Local app state (prototype). Will move to Supabase (accounts, balances, referrals).
 * SONAR COIN live only inside the app: they can be bought, never withdrawn.
 */

export type Position = {
  id: string;
  symbol: string;
  units: number;
  invested: number; // SC spent, fees included
  openPrice: number;
  openedAt: number;
};

export type Trade = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number; // SC moved
  pnl?: number;
  at: number;
};

type State = {
  onboarded: boolean;
  theme: ThemeName;
  plan: PlanId | null;
  trialEndsAt: number | null;
  balance: number;
  positions: Position[];
  trades: Trade[];
  xp: number;
  completedLessons: string[];
  referrals: number;
  referralCode: string;
  ownedSkins: string[];
};

type Action =
  | { type: 'startTrial' }
  | { type: 'setTheme'; theme: ThemeName }
  | { type: 'subscribe'; plan: PlanId; coins: number }
  | { type: 'buy'; symbol: string; amount: number; price: number }
  | { type: 'sell'; id: string; price: number }
  | { type: 'addCoins'; coins: number }
  | { type: 'completeLesson'; id: string; xp: number; coins: number }
  | { type: 'fakeReferral' }
  | { type: 'buySkin'; id: string; price: number };

const uid = () => Math.random().toString(36).slice(2, 10);

const initialState: State = {
  onboarded: false,
  theme: 'diamond',
  plan: null,
  trialEndsAt: null,
  balance: 0,
  positions: [],
  trades: [],
  xp: 0,
  completedLessons: [],
  referrals: 0,
  referralCode: `SONAR-${uid().slice(0, 5).toUpperCase()}`,
  ownedSkins: [],
};

export function sellValue(p: Position, price: number) {
  const c = COSTS[kindOf(p.symbol)];
  return p.units * price * (1 - c.spread / 2) * (1 - c.fee);
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'startTrial':
      return {
        ...s,
        onboarded: true,
        plan: 'base',
        trialEndsAt: Date.now() + TRIAL_DAYS * 86400000,
        balance: s.balance + WELCOME_COINS,
      };
    case 'setTheme':
      return { ...s, theme: a.theme };
    case 'subscribe':
      return { ...s, plan: a.plan, trialEndsAt: null, balance: s.balance + a.coins };
    case 'buy': {
      if (a.amount <= 0 || a.amount > s.balance) return s;
      const c = COSTS[kindOf(a.symbol)];
      const fill = a.price * (1 + c.spread / 2);
      const units = (a.amount * (1 - c.fee)) / fill;
      const pos: Position = { id: uid(), symbol: a.symbol, units, invested: a.amount, openPrice: fill, openedAt: Date.now() };
      return {
        ...s,
        balance: s.balance - a.amount,
        positions: [pos, ...s.positions],
        trades: [{ id: uid(), symbol: a.symbol, side: 'buy', amount: a.amount, at: Date.now() }, ...s.trades],
      };
    }
    case 'sell': {
      const p = s.positions.find((x) => x.id === a.id);
      if (!p) return s;
      const value = sellValue(p, a.price);
      return {
        ...s,
        balance: s.balance + value,
        positions: s.positions.filter((x) => x.id !== a.id),
        trades: [
          { id: uid(), symbol: p.symbol, side: 'sell', amount: value, pnl: value - p.invested, at: Date.now() },
          ...s.trades,
        ],
      };
    }
    case 'addCoins':
      return { ...s, balance: s.balance + a.coins };
    case 'completeLesson':
      if (s.completedLessons.includes(a.id)) return s;
      return { ...s, completedLessons: [...s.completedLessons, a.id], xp: s.xp + a.xp, balance: s.balance + a.coins };
    case 'fakeReferral':
      return { ...s, referrals: s.referrals + 1, balance: s.balance + REFERRAL_REWARD };
    case 'buySkin':
      if (s.balance < a.price || s.ownedSkins.includes(a.id)) return s;
      return { ...s, balance: s.balance - a.price, ownedSkins: [...s.ownedSkins, a.id] };
  }
}

type Ctx = State & {
  dispatch: (a: Action) => void;
  startTrial: () => void;
  setTheme: (t: ThemeName) => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const startTrial = useCallback(() => dispatch({ type: 'startTrial' }), []);
  const setTheme = useCallback((theme: ThemeName) => dispatch({ type: 'setTheme', theme }), []);
  const value = useMemo(() => ({ ...state, dispatch, startTrial, setTheme }), [state, startTrial, setTheme]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
