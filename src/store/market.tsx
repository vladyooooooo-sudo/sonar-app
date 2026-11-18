import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { ASSETS, type Asset } from '@/data/assets';

/**
 * Market feed. For now a realistic random-walk simulator so the app feels live;
 * the SONAR engine (real Binance / Alpaca streams) will replace `tick()`.
 */

const HISTORY = 90;
const TICK_MS = 1500;

export type Quote = {
  asset: Asset;
  price: number;
  open: number;
  change: number; // % vs open
  history: number[];
  volumeBoost: number; // x times average volume
};

type MarketState = Record<string, Quote>;

function seedHistory(a: Asset): number[] {
  const out: number[] = [];
  let p = a.base * (1 - a.vol * 20 * (Math.random() - 0.4));
  for (let i = 0; i < HISTORY; i++) {
    p = p * (1 + (Math.random() - 0.48) * a.vol * 3);
    out.push(p);
  }
  return out;
}

function initial(): MarketState {
  const s: MarketState = {};
  for (const a of ASSETS) {
    const history = seedHistory(a);
    const price = history[history.length - 1];
    const open = history[0];
    s[a.symbol] = {
      asset: a,
      price,
      open,
      change: ((price - open) / open) * 100,
      history,
      volumeBoost: 0.6 + Math.random() * 2.6,
    };
  }
  return s;
}

function tick(prev: MarketState): MarketState {
  const next: MarketState = {};
  for (const key in prev) {
    const q = prev[key];
    const drift = (Math.random() - 0.495) * q.asset.vol * 2;
    const price = q.price * (1 + drift);
    const history = [...q.history.slice(1), price];
    next[key] = {
      ...q,
      price,
      change: ((price - q.open) / q.open) * 100,
      history,
      volumeBoost: Math.max(0.4, q.volumeBoost + (Math.random() - 0.5) * 0.15),
    };
  }
  return next;
}

const MarketContext = createContext<MarketState | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MarketState>(initial);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => setState(tick), TICK_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return <MarketContext.Provider value={state}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider');
  return ctx;
}

export function useQuote(symbol: string) {
  return useMarket()[symbol];
}
