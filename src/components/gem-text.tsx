import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { font } from '@/theme/tokens';

type Props = {
  text: string;
  size: number;
  colors: readonly string[];
  spacing?: number;
  family?: string;
  weight?: string;
};

/** Gradient-filled text (logo wordmark, big hero numbers). */
export function GemText({ text, size, colors, spacing = 0, family = font.displayHeavy, weight }: Props) {
  const width = Math.ceil(text.length * size * 0.82 + spacing * (text.length + 1));
  const height = Math.ceil(size * 1.25);
  const id = `gt-${text.replace(/[^a-z0-9]/gi, '')}-${colors.join('').replace(/[^a-z0-9]/gi, '').slice(0, 24)}`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {colors.map((c, i) => (
            <Stop key={i} offset={i / Math.max(1, colors.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <SvgText
        x={width / 2 + spacing / 2}
        y={size}
        fontSize={size}
        fontFamily={family}
        fontWeight={weight}
        letterSpacing={spacing}
        textAnchor="middle"
        fill={`url(#${id})`}>
        {text}
      </SvgText>
    </Svg>
  );
}
