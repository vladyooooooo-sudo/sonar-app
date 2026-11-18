const nf = (min: number, max: number) =>
  new Intl.NumberFormat('it-IT', { minimumFractionDigits: min, maximumFractionDigits: max });

const n0 = nf(0, 0);
const n2 = nf(2, 2);

export function formatSC(value: number, decimals = 2) {
  return (decimals === 0 ? n0 : n2).format(value);
}

export function formatPrice(value: number) {
  if (value >= 1000) return nf(2, 2).format(value);
  if (value >= 1) return nf(2, 3).format(value);
  if (value >= 0.01) return nf(4, 4).format(value);
  return nf(6, 8).format(value);
}

export function formatPct(value: number, withSign = true) {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${n2.format(value)}%`;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
