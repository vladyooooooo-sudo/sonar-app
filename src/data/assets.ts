export type AssetKind = 'crypto' | 'stock';

export type Asset = {
  symbol: string;
  name: string;
  kind: AssetKind;
  /** Starting price for the simulated feed. */
  base: number;
  /** Per-tick volatility used by the simulator. */
  vol: number;
  color: string;
  /** True when prices come from the simulator, not a live market feed. */
  simulated?: boolean;
};

const CRYPTO_NAMES: Record<string, { name: string; color: string }> = {
  BTC: { name: 'Bitcoin', color: '#F7931A' },
  ETH: { name: 'Ethereum', color: '#627EEA' },
  SOL: { name: 'Solana', color: '#14C98B' },
  XRP: { name: 'XRP', color: '#23292F' },
  BNB: { name: 'BNB', color: '#F0B90B' },
  ADA: { name: 'Cardano', color: '#0033AD' },
  DOGE: { name: 'Dogecoin', color: '#C2A633' },
  AVAX: { name: 'Avalanche', color: '#E84142' },
  LINK: { name: 'Chainlink', color: '#2A5ADA' },
  DOT: { name: 'Polkadot', color: '#E6007A' },
  TRX: { name: 'TRON', color: '#EF0027' },
  LTC: { name: 'Litecoin', color: '#345D9D' },
  SHIB: { name: 'Shiba Inu', color: '#E44B12' },
  PEPE: { name: 'Pepe', color: '#3D9A3D' },
  SUI: { name: 'Sui', color: '#4DA2FF' },
  TON: { name: 'Toncoin', color: '#0098EA' },
  NEAR: { name: 'NEAR', color: '#00C08B' },
  APT: { name: 'Aptos', color: '#1B1B1B' },
  ARB: { name: 'Arbitrum', color: '#28A0F0' },
  OP: { name: 'Optimism', color: '#FF0420' },
  UNI: { name: 'Uniswap', color: '#FF007A' },
  ATOM: { name: 'Cosmos', color: '#2E3148' },
  FIL: { name: 'Filecoin', color: '#0090FF' },
  BCH: { name: 'Bitcoin Cash', color: '#8DC351' },
  ETC: { name: 'Ethereum Classic', color: '#328332' },
  HBAR: { name: 'Hedera', color: '#222222' },
  INJ: { name: 'Injective', color: '#0082FA' },
  RENDER: { name: 'Render', color: '#CF1011' },
  FET: { name: 'Fetch.ai', color: '#1D2A3F' },
  WIF: { name: 'dogwifhat', color: '#B58A5E' },
};

function hashColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 62%, 46%)`;
}

export function cryptoAsset(base: string, price: number): Asset {
  const known = CRYPTO_NAMES[base];
  return {
    symbol: base,
    name: known?.name ?? base,
    kind: 'crypto',
    base: price,
    vol: 0.002,
    color: known?.color ?? hashColor(base),
  };
}

/** Simulated crypto set, used only when the live feed is unreachable. */
export const DEMO_CRYPTO: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', base: 91840, vol: 0.0016, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', kind: 'crypto', base: 3215, vol: 0.002, color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', kind: 'crypto', base: 186.4, vol: 0.003, color: '#14C98B' },
  { symbol: 'XRP', name: 'XRP', kind: 'crypto', base: 2.31, vol: 0.003, color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', kind: 'crypto', base: 0.812, vol: 0.0032, color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', kind: 'crypto', base: 0.2134, vol: 0.004, color: '#C2A633' },
  { symbol: 'AVAX', name: 'Avalanche', kind: 'crypto', base: 38.12, vol: 0.0034, color: '#E84142' },
  { symbol: 'LINK', name: 'Chainlink', kind: 'crypto', base: 17.45, vol: 0.003, color: '#2A5ADA' },
  { symbol: 'DOT', name: 'Polkadot', kind: 'crypto', base: 6.94, vol: 0.003, color: '#E6007A' },
].map((a) => ({ ...a, kind: 'crypto' as const, simulated: true }));

/**
 * Stocks stay simulated until a stock data provider (Alpaca / Polygon) is connected:
 * real-time stock prices need an API key.
 */
export const DEMO_STOCKS: Asset[] = [
  { symbol: 'AAPL', name: 'Apple', base: 231.6, vol: 0.0008, color: '#A2AAAD' },
  { symbol: 'NVDA', name: 'NVIDIA', base: 142.3, vol: 0.0014, color: '#76B900' },
  { symbol: 'TSLA', name: 'Tesla', base: 338.9, vol: 0.0018, color: '#CC0000' },
  { symbol: 'MSFT', name: 'Microsoft', base: 418.2, vol: 0.0008, color: '#00A4EF' },
  { symbol: 'AMZN', name: 'Amazon', base: 204.7, vol: 0.001, color: '#FF9900' },
  { symbol: 'META', name: 'Meta', base: 571.4, vol: 0.0012, color: '#0866FF' },
  { symbol: 'ENI', name: 'Eni', base: 13.82, vol: 0.0008, color: '#FFD200' },
].map((a) => ({ ...a, kind: 'stock' as const, simulated: true }));

const STOCK_SYMBOLS = new Set(DEMO_STOCKS.map((s) => s.symbol));

export function kindOf(symbol: string): AssetKind {
  return STOCK_SYMBOLS.has(symbol) ? 'stock' : 'crypto';
}

/** Simulated trading costs, so demo results match what real money would return. */
export const COSTS = {
  crypto: { fee: 0.0026, spread: 0.001 },
  stock: { fee: 0.001, spread: 0.0005 },
} as const;
