import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from 'react-native-svg';

import { GemText } from '@/components/gem-text';

type Props = {
  size?: number;
  colors: readonly string[];
  /** Facet line color. */
  facet?: string;
  wordmark?: boolean;
  wordmarkColor?: readonly string[];
  ping?: boolean;
};

/** The SONAR mark: a cut diamond inside a sonar ring, with pings radiating out. */
export function SonarMark({ size = 64, colors, facet = 'rgba(255,255,255,0.75)' }: Omit<Props, 'wordmark'>) {
  const id = `gem-${colors.join('').replace(/[^a-z0-9]/gi, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {colors.map((c, i) => (
            <Stop key={i} offset={i / (colors.length - 1)} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="46" stroke={`url(#${id})`} strokeWidth="2.5" fill="none" opacity={0.9} />
      <Path d="M72 14 A44 44 0 0 1 90 34" stroke={`url(#${id})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <Path d="M24 88 A44 44 0 0 1 10 70" stroke={`url(#${id})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <Path d="M22 40 L37 23 L63 23 L78 40 L50 80 Z" fill={`url(#${id})`} />
      <Path
        d="M22 40 L78 40 M37 23 L43 40 L50 23 L57 40 L63 23 M43 40 L50 80 L57 40"
        stroke={facet}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M30 33 L37 25" stroke="rgba(255,255,255,0.95)" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

function PingRing({ size, color, delay }: { size: number; color: string; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1));
  }, [delay, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - t.value),
    transform: [{ scale: 0.85 + t.value * 0.9 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: color },
        style,
      ]}
    />
  );
}

export function SonarLogo({ size = 64, colors, facet, wordmark, wordmarkColor, ping }: Props) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {ping && (
          <>
            <PingRing size={size} color={colors[1]} delay={0} />
            <PingRing size={size} color={colors[2] ?? colors[1]} delay={1200} />
          </>
        )}
        <SonarMark size={size} colors={colors} facet={facet} />
      </View>
      {wordmark && (
        <View style={{ marginTop: size * 0.22 }}>
          <GemText text="SONAR" size={size * 0.46} colors={wordmarkColor ?? colors} spacing={size * 0.09} />
        </View>
      )}
    </View>
  );
}
