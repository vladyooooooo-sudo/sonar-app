import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { haptic } from '@/lib/haptics';
import { font, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'home' },
  impara: { label: 'Impara', icon: 'learn' },
  radar: { label: 'Radar', icon: 'radar' },
  shop: { label: 'Shop', icon: 'shop' },
  invita: { label: 'Invita', icon: 'gift' },
};

function TabItem({ name, focused, onPress }: { name: string; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const s = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [focused, s]);
  const iconSt = useAnimatedStyle(() => ({ transform: [{ translateY: -s.value * 2 }, { scale: 1 + s.value * 0.12 }] }));
  const dotSt = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scaleX: s.value }] }));
  const meta = TABS[name];
  const color = focused ? t.text : t.textFaint;
  return (
    <Pressable
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={meta.label}>
      <Animated.View style={iconSt}>
        <Icon name={meta.icon} size={23} color={color} stroke={focused ? 2.2 : 1.8} />
      </Animated.View>
      <Text style={[styles.label, { color }]}>{meta.label}</Text>
      <Animated.View style={[styles.dot, { backgroundColor: t.accent }, dotSt]} />
    </Pressable>
  );
}

function RadarButton({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const pulse = useSharedValue(0);
  const press = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1);
  }, [pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.55 }] }));
  const body = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  return (
    <Pressable
      onPressIn={() => {
        press.value = withSpring(0.9);
        haptic.press();
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 8 });
      }}
      onPress={onPress}
      style={styles.radarWrap}
      accessibilityRole="tab"
      accessibilityLabel="Radar"
      accessibilityState={{ selected: focused }}>
      <Animated.View style={[styles.radarRing, { borderColor: t.gem[1] }, ring]} />
      <Animated.View style={[styles.radarBtn, { shadowColor: t.glow }, body]}>
        <LinearGradient colors={t.dark ? t.primary : t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { borderRadius: 34, borderWidth: 1.5, borderColor: t.gem[1] }]} />
        <Icon name="radar" size={30} color={t.dark ? '#140F04' : '#FFFFFF'} stroke={2.2} />
      </Animated.View>
    </Pressable>
  );
}

export function SonarTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.bar, { borderColor: t.border, shadowColor: t.dark ? '#000' : '#1B2A6B' }]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={40}
            tint={t.dark ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.xl, overflow: 'hidden' }]}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.tabBar, borderRadius: radius.xl }]} />
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const onPress = () => {
            if (!focused) navigateToTab(route.key);
          };
          if (!TABS[route.name]) return null;
          return route.name === 'radar' ? (
            <RadarButton key={route.key} focused={focused} onPress={onPress} />
          ) : (
            <TabItem key={route.key} name={route.name} focused={focused} onPress={onPress} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'visible',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%' },
  label: { fontFamily: font.bodyBold, fontSize: 11 },
  dot: { width: 16, height: 3, borderRadius: 2, marginTop: 1 },
  radarWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -34 },
  radarRing: { position: 'absolute', width: 68, height: 68, borderRadius: 34, borderWidth: 2 },
  radarBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
