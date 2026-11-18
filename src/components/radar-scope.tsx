import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop, LinearGradient } from 'react-native-svg';

type Blip = { id: string; angle: number; dist: number; strong: boolean; label: string };

function BlipDot({ blip, size, color, onPress }: { blip: Blip; size: number; color: string; onPress?: () => void }) {
  const r = (size / 2) * blip.dist;
  const x = size / 2 + Math.cos(blip.angle) * r;
  const y = size / 2 + Math.sin(blip.angle) * r;
  const p = useSharedValue(0);
  useEffect(() => {
    // light up roughly when the sweep passes over the blip
    const delay = ((((blip.angle + Math.PI / 2) / (Math.PI * 2)) % 1 + 1) % 1) * 4000;
    p.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 180 }), withTiming(0.25, { duration: 3820, easing: Easing.out(Easing.quad) })),
        -1,
      ),
    );
  }, [blip.angle, p]);
  const st = useAnimatedStyle(() => ({ opacity: 0.35 + p.value * 0.65, transform: [{ scale: 0.8 + p.value * 0.6 }] }));
  const d = blip.strong ? 14 : 9;
  return (
    <Pressable onPress={onPress} hitSlop={14} style={{ position: 'absolute', left: x - d / 2, top: y - d / 2 }}>
      <Animated.View
        style={[
          {
            width: d,
            height: d,
            borderRadius: d / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 8,
          },
          st,
        ]}
      />
    </Pressable>
  );
}

export function RadarScope({
  size,
  ring,
  sweep,
  blipColor,
  blips,
  onBlipPress,
}: {
  size: number;
  ring: string;
  sweep: string;
  blipColor: string;
  blips: Blip[];
  onBlipPress?: (id: string) => void;
}) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1);
  }, [rot]);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const c = size / 2;
  // 70° wedge trailing the sweep line (pointing up at 0deg)
  const wedge = (() => {
    const a0 = -Math.PI / 2;
    const a1 = a0 - (70 * Math.PI) / 180;
    return `M${c},${c} L${c + Math.cos(a0) * c},${c + Math.sin(a0) * c} A${c},${c} 0 0 0 ${c + Math.cos(a1) * c},${c + Math.sin(a1) * c} Z`;
  })();

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="rbg" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={sweep} stopOpacity={0.16} />
            <Stop offset="1" stopColor={sweep} stopOpacity={0.02} />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={c - 1} fill="url(#rbg)" stroke={ring} strokeWidth={1.2} />
        {[0.75, 0.5, 0.25].map((k) => (
          <Circle key={k} cx={c} cy={c} r={c * k} fill="none" stroke={ring} strokeWidth={1} strokeDasharray={k === 0.5 ? '3 5' : undefined} />
        ))}
        <Line x1={c} y1={0} x2={c} y2={size} stroke={ring} strokeWidth={0.8} />
        <Line x1={0} y1={c} x2={size} y2={c} stroke={ring} strokeWidth={0.8} />
      </Svg>
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, st]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="sw" x1="0.5" y1="0" x2="0" y2="0.5">
              <Stop offset="0" stopColor={sweep} stopOpacity={0.55} />
              <Stop offset="1" stopColor={sweep} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={wedge} fill="url(#sw)" />
          <Line x1={c} y1={c} x2={c} y2={0} stroke={sweep} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Animated.View>
      {blips.map((b) => (
        <BlipDot key={b.id} blip={b} size={size} color={blipColor} onPress={() => onBlipPress?.(b.id)} />
      ))}
      <View
        style={{
          position: 'absolute',
          left: c - 5,
          top: c - 5,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: sweep,
        }}
      />
    </View>
  );
}
