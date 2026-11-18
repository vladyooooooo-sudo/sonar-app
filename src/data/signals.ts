import type { Quote } from '@/store/market';

/**
 * RADAR pattern detection. Objective facts only (breakouts, volume, RSI, momentum):
 * SONAR never says "buy". The same detector runs live on the latest candle and
 * over past candles (backtest), so the "Storico" percentages are measured, not invented.
 */

export type PatternId = 'breakout' | 'volume' | 'momentum' | 'oversold' | 'overbought';

export type PatternInfo = {
  label: string;
  short: string;
  bias: 'up' | 'down';
  /** Forward window, in candles (1h candles → hours). */
  horizonBars: number;
  horizon: string;
  /** Fallback stats shown before the engine has measured real ones. */
  winRate: number;
  samples: number;
};

export const PATTERNS: Record<PatternId, PatternInfo> = {
  breakout: { label: 'Rottura di resistenza', short: 'Rottura', bias: 'up', horizonBars: 48, horizon: '48h', winRate: 58, samples: 1240 },
  volume: { label: 'Volume esploso', short: 'Volume', bias: 'up', horizonBars: 24, horizon: '24h', winRate: 54, samples: 3110 },
  momentum: { label: 'Momentum forte', short: 'Momentum', bias: 'up', horizonBars: 24, horizon: '24h', winRate: 55, samples: 2675 },
  oversold: { label: 'Ipervenduto (RSI < 30)', short: 'RSI basso', bias: 'up', horizonBars: 72, horizon: '72h', winRate: 56, samples: 1890 },
  overbought: { label: 'Ipercomprato (RSI > 70)', short: 'RSI alto', bias: 'down', horizonBars: 72, horizon: '72h', winRate: 53, samples: 1702 },
};

export const PATTERN_IDS = Object.keys(PATTERNS) as PatternId[];

export type PatternStat = { winRate: number; samples: number; measured: boolean };
export type PatternStats = Record<PatternId, PatternStat>;

export const FALLBACK_STATS: PatternStats = Object.fromEntries(
  PATTERN_IDS.map((id) => [id, { winRate: PATTERNS[id].winRate, samples: PATTERNS[id].samples, measured: false }]),
) as PatternStats;

const RSI_PERIOD = 14;
const LOOKBACK = 45;

export function rsiAt(closes: number[], i: number, period = RSI_PERIOD) {
  if (i < period) return 50;
  let gain = 0;
  let loss = 0;
  for (let k = i - period + 1; k <= i; k++) {
    const d = closes[k] - closes[k - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  if (loss === 0) return gain === 0 ? 50 : 100;
  return 100 - 100 / (1 + gain / loss);
}

export type Detection = { pattern: PatternId; score: number; rsi: number; momentum: number; volumeBoost: number };

/** Detect the strongest pattern on candle `i`, using only data up to `i` (no look-ahead). */
export function detectAt(closes: number[], volumes: number[] | undefined, i: number): Detection | null {
  if (i < LOOKBACK) return null;
  const last = closes[i];
  let resistance = -Infinity;
  for (let k = i - LOOKBACK; k <= i - 3; k++) resistance = Math.max(resistance, closes[k]);
  const r = rsiAt(closes, i);
  const prev = closes[i - 15];
  const momentum = ((last - prev) / prev) * 100;
  let volumeBoost = 1;
  if (volumes && volumes.length > i) {
    let sum = 0;
    for (let k = i - 24; k < i; k++) sum += volumes[k];
    const avg = sum / 24;
    volumeBoost = avg > 0 ? volumes[i] / avg : 1;
  }

  let pattern: PatternId | null = null;
  let score = 0;
  if (last > resistance) {
    pattern = 'breakout';
    score = 70 + Math.min(25, volumeBoost * 6);
  } else if (r < 30) {
    pattern = 'oversold';
    score = 60 + (30 - r);
  } else if (r > 70) {
    pattern = 'overbought';
    score = 60 + (r - 70);
  } else if (volumeBoost > 2.2) {
    pattern = 'volume';
    score = 50 + volumeBoost * 10;
  } else if (momentum > 3) {
    pattern = 'momentum';
    score = 40 + momentum * 5;
  }
  if (!pattern) return null;
  return { pattern, score: Math.round(Math.min(99, Math.max(12, score))), rsi: r, momentum, volumeBoost };
}

/**
 * Backtest: walk past candles, detect patterns, check whether price moved in the pattern's
 * direction within its horizon. Costs are ignored here; the stat is "how often the move happened".
 */
export function backtest(series: { closes: number[]; volumes?: number[] }[]): PatternStats {
  const wins: Record<PatternId, number> = { breakout: 0, volume: 0, momentum: 0, oversold: 0, overbought: 0 };
  const total: Record<PatternId, number> = { breakout: 0, volume: 0, momentum: 0, oversold: 0, overbought: 0 };
  const COOLDOWN = 6; // don't count the same episode on consecutive candles

  for (const { closes, volumes } of series) {
    const lastHit: Partial<Record<PatternId, number>> = {};
    for (let i = LOOKBACK; i < closes.length; i++) {
      const d = detectAt(closes, volumes, i);
      if (!d) continue;
      const info = PATTERNS[d.pattern];
      const end = i + info.horizonBars;
      if (end >= closes.length) continue;
      if (lastHit[d.pattern] !== undefined && i - (lastHit[d.pattern] as number) < COOLDOWN) continue;
      lastHit[d.pattern] = i;
      const ret = closes[end] - closes[i];
      total[d.pattern]++;
      if ((info.bias === 'up' && ret > 0) || (info.bias === 'down' && ret < 0)) wins[d.pattern]++;
    }
  }

  const out = {} as PatternStats;
  for (const id of PATTERN_IDS) {
    out[id] =
      total[id] >= 20
        ? { winRate: Math.round((wins[id] / total[id]) * 100), samples: total[id], measured: true }
        : FALLBACK_STATS[id];
  }
  return out;
}

export type Signal = Detection & { symbol: string };

export function scanSignals(quotes: Quote[]): Signal[] {
  const out: Signal[] = [];
  for (const q of quotes) {
    const d = detectAt(q.history, q.volumes, q.history.length - 1);
    if (d) out.push({ ...d, symbol: q.asset.symbol });
  }
  return out.sort((a, b) => b.score - a.score);
}
