import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { RankBadge } from '@/components/rank-badge';
import { GemButton } from '@/components/ui';
import { TIERS } from '@/data/ranks';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font } from '@/theme/tokens';

function Spark({ i, color }: { i: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(i * 40, withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1));
  }, [i, t]);
  const a = (i / 18) * Math.PI * 2;
  const st = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateX: Math.cos(a) * 160 * t.value }, { translateY: Math.sin(a) * 160 * t.value }, { scale: 1 - t.value * 0.6 }],
  }));
  return <Animated.View style={[{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: color }, st]} />;
}

/** Full-screen promotion celebration, shown when a closed trade moves you up a tier. */
export function RankUpOverlay() {
  const { rankUp, dispatch } = useApp();
  useEffect(() => {
    if (rankUp) haptic.success();
  }, [rankUp]);
  if (!rankUp) return null;
  const tier = TIERS.find((x) => x.id === rankUp.to)!;
  const close = () => dispatch({ type: 'clearRankUp' });
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(4,6,18,0.88)', alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Text style={{ fontFamily: font.bodyBold, fontSize: 13, letterSpacing: 3, color: tier.colors[0] }}>PROMOZIONE</Text>
      <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <Spark key={i} i={i} color={tier.colors[i % 3]} />
        ))}
        <Animated.View entering={ZoomIn.springify().damping(8)}>
          <RankBadge tier={tier} size={210} />
        </Animated.View>
      </View>
      <Text style={{ fontFamily: font.displayHeavy, fontSize: 40, color: '#fff', marginTop: 8 }}>{tier.name}</Text>
      <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: 'rgba(220,232,255,0.75)', marginTop: 4 }}>{tier.title}</Text>
      <View style={{ alignSelf: 'stretch', marginTop: 32, gap: 12 }}>
        <GemButton
          variant="gem"
          title="Vedi il tuo grado"
          onPress={() => {
            close();
            router.push('/ranked');
          }}
        />
      </View>
    </Animated.View>
  );
}
