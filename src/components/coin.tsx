import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { formatSC } from '@/lib/format';
import { useTheme } from '@/theme/use-theme';
import { font } from '@/theme/tokens';

/** The SONAR COIN glyph: a faceted gem coin. */
export function CoinGlyph({ size = 18, colors }: { size?: number; colors?: readonly string[] }) {
  const t = useTheme();
  const c = colors ?? t.gem;
  const id = `coin-${c.join('').replace(/[^a-z0-9]/gi, '').slice(0, 20)}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {c.map((col, i) => (
            <Stop key={i} offset={i / (c.length - 1)} stopColor={col} />
          ))}
        </LinearGradient>
      </Defs>
      <Circle cx="12" cy="12" r="11" fill={`url(#${id})`} />
      <Circle cx="12" cy="12" r="8.4" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
      <Path d="M7.5 10.5 9.6 8h4.8l2.1 2.5L12 17z" fill="rgba(255,255,255,0.92)" />
      <Path d="M7.5 10.5h9M9.6 8 11 10.5 12 8l1 2.5L14.4 8M11 10.5l1 6.5 1-6.5" stroke={c[2] ?? c[0]} strokeWidth="0.7" fill="none" />
    </Svg>
  );
}

export function CoinAmount({
  value,
  size = 15,
  color,
  decimals = 0,
}: {
  value: number;
  size?: number;
  color?: string;
  decimals?: number;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <CoinGlyph size={size + 3} />
      <Text style={{ fontFamily: font.display, fontSize: size, color: color ?? t.text }}>{formatSC(value, decimals)}</Text>
    </View>
  );
}
