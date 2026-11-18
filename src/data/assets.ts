export type AssetKind = 'crypto' | 'stock';

export type Asset = {
  symbol: string;
  name: string;
  kind: AssetKind;
  /** Starting price for the simulated feed (replaced by the live engine later). */
  base: number;
  /** Per-tick volatility used by the simulator. */
  vol: number;
  color: string;
};

export const ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', base: 91840, vol: 0.0016, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', kind: 'crypto', base: 3215, vol: 0.002, color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', kind: 'crypto', base: 186.4, vol: 0.003, color: '#14F195' },
  { symbol: 'XRP', name: 'XRP', kind: 'crypto', base: 2.31, vol: 0.003, color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', kind: 'crypto', base: 0.812, vol: 0.0032, color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', kind: 'crypto', base: 0.2134, vol: 0.004, color: '#C2A633' },
  { symbol: 'AVAX', name: 'Avalanche', kind: 'crypto', base: 38.12, vol: 0.0034, color: '#E84142' },
  { symbol: 'LINK', name: 'Chainlink', kind: 'crypto', base: 17.45, vol: 0.003, color: '#2A5ADA' },
  { symbol: 'DOT', name: 'Polkadot', kind: 'crypto', base: 6.94, vol: 0.003, color: '#E6007A' },
  { symbol: 'AAPL', name: 'Apple', kind: 'stock', base: 231.6, vol: 0.0008, color: '#A2AAAD' },
  { symbol: 'NVDA', name: 'NVIDIA', kind: 'stock', base: 142.3, vol: 0.0014, color: '#76B900' },
  { symbol: 'TSLA', name: 'Tesla', kind: 'stock', base: 338.9, vol: 0.0018, color: '#CC0000' },
  { symbol: 'MSFT', name: 'Microsoft', kind: 'stock', base: 418.2, vol: 0.0008, color: '#00A4EF' },
  { symbol: 'AMZN', name: 'Amazon', kind: 'stock', base: 204.7, vol: 0.001, color: '#FF9900' },
  { symbol: 'META', name: 'Meta', kind: 'stock', base: 571.4, vol: 0.0012, color: '#0866FF' },
  { symbol: 'ENI', name: 'Eni', kind: 'stock', base: 13.82, vol: 0.0008, color: '#FFD200' },
];

export const ASSET_MAP = Object.fromEntries(ASSETS.map((a) => [a.symbol, a])) as Record<string, Asset>;

/** Simulated trading costs, so demo results match what real money would return. */
export const COSTS = {
  crypto: { fee: 0.0026, spread: 0.001 },
  stock: { fee: 0.001, spread: 0.0005 },
} as const;
