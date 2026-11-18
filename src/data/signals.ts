import type { Quote } from '@/store/market';

/**
 * RADAR signal scoring. Objective facts only (momentum, volume, breakouts, RSI):
 * SONAR never says "buy". The historical stats per pattern are placeholders until
 * the engine backtests them on real data.
 */

export type PatternId = 'breakout' | 'volume' | 'momentum' | 'oversold' | 'overbought';

export const PATTERNS: Record<
  PatternId,
  { label: string; short: string; bias: 'up' | 'down'; winRate: number; samples: number; horizon: string }
> = {
  breakout: { label: 'Rottura di resistenza', short: 'Rottura', bias: 'up', winRate: 58, samples: 1240, horizon: '48h' },
  volume: { label: 'Volume esploso', short: 'Volume', bias: 'up', winRate: 54, samples: 3110, horizon: '24h' },
  momentum: { label: 'Momentum forte', short: 'Momentum', bias: 'up', winRate: 55, samples: 2675, horizon: '24h' },
  oversold: { label: 'Ipervenduto (RSI < 30)', short: 'RSI basso', bias: 'up', winRate: 56, samples: 1890, horizon: '72h' },
  overbought: { label: 'Ipercomprato (RSI > 70)', short: 'RSI alto', bias: 'down', winRate: 53, samples: 1702, horizon: '72h' },
};

export type Signal = {
  symbol: string;
  pattern: PatternId;
  score: number; // 0-100 strength
  rsi: number;
  momentum: number; // % last 15 ticks
  volumeBoost: number;
};

export function rsi(values: number[], period = 14) {
  if (values.length <= period) return 50;
  let gain = 0;
  let loss = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  if (loss === 0) return 100;
  const rs = gain / loss;
  return 100 - 100 / (1 + rs);
}

export function scanSignals(quotes: Quote[]): Signal[] {
  const out: Signal[] = [];
  for (const q of quotes) {
    const h = q.history;
    const last = h[h.length - 1];
    const prev15 = h[h.length - 16] ?? h[0];
    const momentum = ((last - prev15) / prev15) * 100;
    const prior = h.slice(-45, -3);
    const resistance = Math.max(...prior);
    const r = rsi(h);
    const momNorm = momentum / (q.asset.vol * 100 * 4);

    let pattern: PatternId;
    let score: number;
    if (last > resistance) {
      pattern = 'breakout';
      score = 70 + Math.min(25, q.volumeBoost * 6);
    } else if (r < 30) {
      pattern = 'oversold';
      score = 60 + (30 - r);
    } else if (r > 70) {
      pattern = 'overbought';
      score = 60 + (r - 70);
    } else if (q.volumeBoost > 2.2) {
      pattern = 'volume';
      score = 50 + q.volumeBoost * 10;
    } else {
      pattern = 'momentum';
      score = 40 + Math.abs(momNorm) * 25;
    }
    out.push({
      symbol: q.asset.symbol,
      pattern,
      score: Math.round(Math.min(99, Math.max(12, score))),
      rsi: r,
      momentum,
      volumeBoost: q.volumeBoost,
    });
  }
  return out.sort((a, b) => b.score - a.score);
}
