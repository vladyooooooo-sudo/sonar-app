import { useEffect, useRef, useState } from 'react';
import { Text, View, type TextStyle, type StyleProp } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { formatSC } from '@/lib/format';
import { font } from '@/theme/tokens';

function buildPath(values: number[], w: number, h: number, pad = 2) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, span === 0 ? h * 0.6 : pad + (h - pad * 2) * (1 - (v - min) / span)] as const);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return { d, last: pts[pts.length - 1] };
}

export function Sparkline({
  values,
  width,
  height,
  color,
  fill = true,
  dot = false,
  strokeWidth = 2,
}: {
  values: number[];
  width: number;
  height: number;
  color: string;
  fill?: boolean;
  dot?: boolean;
  strokeWidth?: number;
}) {
  if (values.length < 2) return <View style={{ width, height }} />;
  const { d, last } = buildPath(values, width, height, dot ? 6 : 2);
  const id = `sp-${color.replace(/[^a-z0-9]/gi, '')}-${width}-${height}`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.32} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill && <Path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />}
      <Path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      {dot && (
        <>
          <Circle cx={last[0] - 1} cy={last[1]} r={7} fill={color} opacity={0.2} />
          <Circle cx={last[0] - 1} cy={last[1]} r={3.5} fill={color} />
        </>
      )}
    </Svg>
  );
}

/** Number that rolls smoothly to its new value (balances, prices). */
export function RollingNumber({
  value,
  format = (v: number) => formatSC(v, 2),
  style,
  duration = 600,
}: {
  value: number;
  format?: (v: number) => string;
  style?: StyleProp<TextStyle>;
  duration?: number;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    const a = from.current;
    const b = value;
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = a + (b - a) * e;
      setShown(v);
      from.current = v;
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <Text style={[{ fontFamily: font.display, fontVariant: ['tabular-nums'] }, style]}>{format(shown)}</Text>;
}
