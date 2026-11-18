/**
 * Binance public market data (no API key). Uses the market-data-only endpoints.
 * Runs on the user's device: every phone talks to Binance directly.
 */

const REST = 'https://data-api.binance.vision/api/v3';
export const STREAM_URL = 'wss://data-stream.binance.vision/ws/!miniTicker@arr';

export type MiniTicker = {
  symbol: string; // e.g. BTCUSDT
  last: number;
  open: number; // 24h open
  quoteVolume: number; // 24h volume in USDT
};

export type Candle = { open: number; high: number; low: number; close: number; quoteVolume: number };

async function getJson<T>(url: string, timeoutMs = 10000): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

const STABLES = new Set(['USDC', 'FDUSD', 'TUSD', 'USDP', 'DAI', 'BUSD', 'EUR', 'EURI', 'USDE', 'AEUR', 'XUSD', 'PAXG', 'WBTC', 'WBETH', 'BFUSD', 'RLUSD', 'USD1']);

const KNOWN_B = new Set<string>([]);

/** Keep real coins quoted in USDT; drop stablecoins and leveraged tokens. */
export function isTradableUsdt(symbol: string) {
  if (!symbol.endsWith('USDT')) return false;
  const base = symbol.slice(0, -4);
  if (!base || STABLES.has(base)) return false;
  if (/(UP|DOWN|BULL|BEAR)$/.test(base) && base.length > 4) return false;
  // tokenized / leveraged stock products (e.g. SOXLB): 5+ letters ending in "B", not a known coin
  if (base.length >= 5 && base.endsWith('B') && !KNOWN_B.has(base)) return false;
  return true;
}

export async function fetchTickers(): Promise<MiniTicker[]> {
  type Raw = { symbol: string; lastPrice: string; openPrice: string; quoteVolume: string };
  const raw = await getJson<Raw[]>(`${REST}/ticker/24hr?type=MINI`);
  return raw
    .filter((r) => isTradableUsdt(r.symbol) && Number(r.quoteVolume) > 0)
    .map((r) => ({ symbol: r.symbol, last: Number(r.lastPrice), open: Number(r.openPrice), quoteVolume: Number(r.quoteVolume) }));
}

export async function fetchCandles(symbol: string, interval = '1h', limit = 500): Promise<Candle[]> {
  // [openTime, open, high, low, close, volume, closeTime, quoteVolume, ...]
  const raw = await getJson<(string | number)[][]>(`${REST}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  return raw.map((k) => ({
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    quoteVolume: Number(k[7]),
  }));
}

/** Parse one frame of the `!miniTicker@arr` stream. */
export function parseStream(data: string): MiniTicker[] {
  type Raw = { s: string; c: string; o: string; q: string };
  const arr = JSON.parse(data) as Raw[];
  if (!Array.isArray(arr)) return [];
  const out: MiniTicker[] = [];
  for (const r of arr) {
    if (!isTradableUsdt(r.s)) continue;
    out.push({ symbol: r.s, last: Number(r.c), open: Number(r.o), quoteVolume: Number(r.q) });
  }
  return out;
}

/** Run async jobs with limited concurrency (be gentle with rate limits and phone data). */
export async function pool<T, R>(items: T[], size: number, job: (t: T) => Promise<R>): Promise<(R | null)[]> {
  const out: (R | null)[] = new Array(items.length).fill(null);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      try {
        out[i] = await job(items[i]);
      } catch {
        out[i] = null;
      }
    }
  });
  await Promise.all(workers);
  return out;
}
