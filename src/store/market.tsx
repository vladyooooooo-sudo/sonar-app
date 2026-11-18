import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { cryptoAsset, DEMO_CRYPTO, DEMO_STOCKS, type Asset } from '@/data/assets';
import { backtest, FALLBACK_STATS, type PatternStats } from '@/data/signals';
import { fetchCandles, fetchTickers, parseStream, pool, STREAM_URL, type MiniTicker } from '@/engine/binance';

/**
 * SONAR market engine.
 *  - Live: every USDT pair on Binance (hundreds) via one WebSocket, prices every second.
 *    The most traded coins get 500 hourly candles each: those feed the charts, the RADAR
 *    detector and the backtest that measures each pattern's real historical hit rate.
 *  - Fallback: if Binance is unreachable, a random-walk simulator, clearly flagged as DEMO.
 *  - Stocks: simulated until a stock data provider key is added.
 */

const DEEP_COUNT = 40; // coins analysed candle-by-candle
const CANDLES = 500; // ≈ 3 weeks of 1h candles each
const CHART_POINTS = 120;
const SIM_TICK_MS = 1500;
const UI_FLUSH_MS = 1000;
const CANDLE_REFRESH_MS = 5 * 60 * 1000;

export type Quote = {
  asset: Asset;
  price: number;
  open: number;
  change: number; // % vs 24h open
  /** Hourly closes (live) or simulated ticks; last value tracks the live price. */
  history: number[];
  volumes?: number[];
  volumeBoost: number;
};

type MarketState = Record<string, Quote>;

export type MarketMeta = {
  source: 'loading' | 'live' | 'demo';
  /** How many instruments the scanner is watching. */
  scanned: number;
  stats: PatternStats;
  updatedAt: number;
};

// ---------- simulator ----------
function seedHistory(a: Asset): number[] {
  const out: number[] = [];
  let p = a.base * (1 - a.vol * 20 * (Math.random() - 0.4));
  for (let i = 0; i < 90; i++) {
    p = p * (1 + (Math.random() - 0.48) * a.vol * 3);
    out.push(p);
  }
  return out;
}

function simQuote(a: Asset): Quote {
  const history = seedHistory(a);
  const price = history[history.length - 1];
  return { asset: a, price, open: history[0], change: ((price - history[0]) / history[0]) * 100, history, volumeBoost: 0.6 + Math.random() * 2.6 };
}

function simTick(q: Quote): Quote {
  const price = q.price * (1 + (Math.random() - 0.495) * q.asset.vol * 2);
  return {
    ...q,
    price,
    change: ((price - q.open) / q.open) * 100,
    history: [...q.history.slice(1), price],
    volumeBoost: Math.max(0.4, q.volumeBoost + (Math.random() - 0.5) * 0.15),
  };
}

function initialState(): MarketState {
  const s: MarketState = {};
  for (const a of [...DEMO_CRYPTO, ...DEMO_STOCKS]) s[a.symbol] = simQuote(a);
  return s;
}

// ---------- live ----------
const baseOf = (pair: string) => pair.slice(0, -4);

async function loadDeep(tickers: MiniTicker[]) {
  const top = [...tickers].sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, DEEP_COUNT);
  const candles = await pool(top, 6, (t) => fetchCandles(t.symbol, '1h', CANDLES));
  const quotes: MarketState = {};
  const series: { closes: number[]; volumes: number[] }[] = [];
  top.forEach((t, i) => {
    const c = candles[i];
    if (!c || c.length < 60) return;
    const closes = c.map((k) => k.close);
    const volumes = c.map((k) => k.quoteVolume);
    closes[closes.length - 1] = t.last;
    series.push({ closes, volumes });
    const base = baseOf(t.symbol);
    const lastVol = volumes[volumes.length - 1];
    const prev = volumes.slice(-25, -1);
    const avg = prev.reduce((s, v) => s + v, 0) / prev.length;
    quotes[base] = {
      asset: cryptoAsset(base, t.last),
      price: t.last,
      open: t.open,
      change: ((t.last - t.open) / t.open) * 100,
      history: closes,
      volumes,
      volumeBoost: avg > 0 ? lastVol / avg : 1,
    };
  });
  return { quotes, stats: series.length ? backtest(series) : FALLBACK_STATS };
}

// ---------- provider ----------
type Ctx = { quotes: MarketState; meta: MarketMeta };
const MarketContext = createContext<Ctx | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<MarketState>(initialState);
  const [meta, setMeta] = useState<MarketMeta>({ source: 'loading', scanned: 0, stats: FALLBACK_STATS, updatedAt: Date.now() });
  const pending = useRef<Map<string, MiniTicker>>(new Map());

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    let simTimer: ReturnType<typeof setInterval> | null = null;
    let flushTimer: ReturnType<typeof setInterval> | null = null;
    let refreshTimer: ReturnType<typeof setInterval> | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;

    const startSimulator = () => {
      if (cancelled || simTimer) return;
      setMeta((m) => ({ ...m, source: 'demo', scanned: DEMO_CRYPTO.length + DEMO_STOCKS.length }));
      simTimer = setInterval(() => {
        setQuotes((prev) => {
          const next: MarketState = {};
          for (const k in prev) next[k] = simTick(prev[k]);
          return next;
        });
      }, SIM_TICK_MS);
    };

    const stockTicker = () =>
      setInterval(() => {
        setQuotes((prev) => {
          const next = { ...prev };
          for (const a of DEMO_STOCKS) if (next[a.symbol]) next[a.symbol] = simTick(next[a.symbol]);
          return next;
        });
      }, SIM_TICK_MS);

    const openStream = () => {
      if (cancelled) return;
      ws = new WebSocket(STREAM_URL);
      ws.onmessage = (e) => {
        for (const t of parseStream(String(e.data))) pending.current.set(t.symbol, t);
      };
      ws.onclose = () => {
        if (!cancelled) reconnect = setTimeout(openStream, 3000);
      };
      ws.onerror = () => ws?.close();
    };

    const flush = () => {
      if (!pending.current.size) return;
      const batch = pending.current;
      pending.current = new Map();
      setQuotes((prev) => {
        let changed = false;
        const next = { ...prev };
        batch.forEach((t) => {
          const q = next[baseOf(t.symbol)];
          if (!q || q.asset.simulated) return;
          const history = q.history.slice();
          history[history.length - 1] = t.last;
          next[q.asset.symbol] = { ...q, price: t.last, open: t.open, change: ((t.last - t.open) / t.open) * 100, history };
          changed = true;
        });
        return changed ? next : prev;
      });
      setMeta((m) => ({ ...m, updatedAt: Date.now() }));
    };

    (async () => {
      try {
        const tickers = await fetchTickers();
        if (cancelled) return;
        const { quotes: live, stats } = await loadDeep(tickers);
        if (cancelled) return;
        if (Object.keys(live).length < 5) throw new Error('not enough live data');
        setQuotes((prev) => {
          const next: MarketState = { ...live };
          for (const a of DEMO_STOCKS) next[a.symbol] = prev[a.symbol] ?? simQuote(a);
          return next;
        });
        setMeta({ source: 'live', scanned: tickers.length, stats, updatedAt: Date.now() });
        openStream();
        flushTimer = setInterval(flush, UI_FLUSH_MS);
        simTimer = stockTicker();
        refreshTimer = setInterval(async () => {
          try {
            const t2 = await fetchTickers();
            const { quotes: fresh, stats: s2 } = await loadDeep(t2);
            if (cancelled || Object.keys(fresh).length < 5) return;
            setQuotes((prev) => {
              const next: MarketState = { ...fresh };
              for (const a of DEMO_STOCKS) next[a.symbol] = prev[a.symbol];
              // keep coins the user may hold even if they dropped out of the top list
              for (const k in prev) if (!next[k]) next[k] = prev[k];
              return next;
            });
            setMeta((m) => ({ ...m, scanned: t2.length, stats: s2 }));
          } catch {
            /* keep current data */
          }
        }, CANDLE_REFRESH_MS);
      } catch {
        startSimulator();
      }
    })();

    return () => {
      cancelled = true;
      ws?.close();
      [simTimer, flushTimer, refreshTimer].forEach((t) => t && clearInterval(t));
      if (reconnect) clearTimeout(reconnect);
    };
  }, []);

  return <MarketContext.Provider value={{ quotes, meta }}>{children}</MarketContext.Provider>;
}

function useCtx() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider');
  return ctx;
}

export function useMarket() {
  return useCtx().quotes;
}

export function useMarketMeta() {
  return useCtx().meta;
}

export function useQuote(symbol: string) {
  return useMarket()[symbol];
}

export const CHART_LEN = CHART_POINTS;
