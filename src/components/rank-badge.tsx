import Svg, { Defs, LinearGradient, Path, Polygon, Stop, Circle } from 'react-native-svg';

import type { Tier } from '@/data/ranks';

/**
 * Rank emblem: a shield whose shape gains detail as the tier rises
 * (wings from Platino, a crown on Leggenda), with a cut gem at its heart.
 */
export function RankBadge({ tier, size = 96 }: { tier: Tier; size?: number }) {
  const [a, b, c] = tier.colors;
  const id = `rk-${tier.id}`;
  const level = ['bronzo', 'argento', 'oro', 'platino', 'diamante', 'leggenda'].indexOf(tier.id);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a} />
          <Stop offset="0.5" stopColor={b} />
          <Stop offset="1" stopColor={c} />
        </LinearGradient>
        <LinearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor={b} />
        </LinearGradient>
      </Defs>
      {level >= 3 && (
        <>
          <Path d="M28 46 C10 44 4 30 6 20 C14 30 22 32 30 32 Z" fill={`url(#${id}-m)`} opacity={0.9} />
          <Path d="M92 46 C110 44 116 30 114 20 C106 30 98 32 90 32 Z" fill={`url(#${id}-m)`} opacity={0.9} />
        </>
      )}
      {level >= 5 && <Path d="M42 18 L48 6 L54 14 L60 2 L66 14 L72 6 L78 18 Z" fill={`url(#${id}-m)`} />}
      <Path d="M60 14 L96 26 L96 60 C96 84 80 102 60 112 C40 102 24 84 24 60 L24 26 Z" fill={`url(#${id}-m)`} />
      <Path
        d="M60 22 L88 32 L88 60 C88 80 76 94 60 103 C44 94 32 80 32 60 L32 32 Z"
        fill="rgba(0,0,0,0.18)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth={1.5}
      />
      {level >= 1 && <Circle cx="60" cy="62" r={26 + level} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} />}
      <Polygon points="44,56 52,46 68,46 76,56 60,80" fill={`url(#${id}-g)`} />
      <Path d="M44 56 L76 56 M52 46 L56 56 L60 46 L64 56 L68 46 M56 56 L60 80 L64 56" stroke={c} strokeWidth={1} fill="none" opacity={0.7} />
      <Path d="M34 30 L58 22" stroke="rgba(255,255,255,0.7)" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
