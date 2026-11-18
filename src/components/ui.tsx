import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that squishes like a game button. */
export function Bouncy({
  children,
  onPress,
  style,
  disabled,
  scaleTo = 0.95,
  accessibilityLabel,
}: {
  accessibilityLabel?: string;
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleTo?: number;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPressIn={() => {
        s.value = withSpring(scaleTo, { damping: 15, stiffness: 400 });
        haptic.tap();
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 9, stiffness: 260 });
      }}
      onPress={onPress}
      style={[style, a, disabled && { opacity: 0.45 }]}>
      {children}
    </AnimatedPressable>
  );
}

/** A diagonal light streak sweeping across a surface, like light on a gem. */
export function Shine({ width = 320, delay = 0, period = 3600 }: { width?: number; delay?: number; period?: number }) {
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: period - 1100 }),
          withTiming(-1, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [delay, period, x]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * width }, { rotate: '20deg' }] }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center' }, st]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: 70, height: '300%', marginTop: '-50%' }}
      />
    </Animated.View>
  );
}

export function GemButton({
  title,
  onPress,
  disabled,
  variant = 'primary',
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'gem' | 'ghost';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const colors = variant === 'gem' ? t.gem : t.primary;
  const textColor = variant === 'ghost' ? t.text : variant === 'gem' ? '#0B1230' : t.onPrimary;
  return (
    <Bouncy
      onPress={() => {
        haptic.press();
        onPress?.();
      }}
      disabled={disabled}
      style={style}>
      <View
        style={[
          styles.btn,
          variant === 'ghost' && { backgroundColor: t.surfaceAlt, borderWidth: 1, borderColor: t.border },
          variant !== 'ghost' && { shadowColor: t.glow, shadowOpacity: 1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
        ]}>
        {variant !== 'ghost' && (
          <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        )}
        {variant !== 'ghost' && <Shine width={260} />}
        {variant === 'primary' && !t.dark && (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.btnRim, { borderColor: 'rgba(160,210,255,0.55)' }]} />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
        </View>
      </View>
    </Bouncy>
  );
}

export function Card({
  children,
  style,
  delay = 0,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const t = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(18)}
      style={[
        styles.card,
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          shadowColor: t.dark ? '#000' : '#1B2A6B',
          shadowOpacity: t.dark ? 0.5 : 0.07,
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}

export function HeroCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      style={[styles.hero, { shadowColor: t.glow }, style]}>
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[t.heroGem[1] + '33', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.heroRim, { borderColor: t.heroGem[2] + '55' }]} />
      <Shine width={420} delay={600} period={5200} />
      {children}
    </Animated.View>
  );
}

export function Txt({
  children,
  style,
  variant = 'body',
  color,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'small' | 'label' | 'num';
  color?: string;
  numberOfLines?: number;
}) {
  const t = useTheme();
  const v = textVariants[variant];
  return (
    <Text numberOfLines={numberOfLines} style={[v, { color: color ?? (variant === 'small' || variant === 'label' ? t.textDim : t.text) }, style]}>
      {children}
    </Text>
  );
}

export function Pill({ label, color, bg, icon }: { label: string; color: string; bg: string; icon?: ReactNode }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon}
      <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color }}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="h3">{title}</Txt>
      {action}
    </View>
  );
}

export function Disclaimer({ compact }: { compact?: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.disclaimer, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
      <Text style={{ fontFamily: font.body, fontSize: compact ? 11 : 12, lineHeight: compact ? 15 : 17, color: t.textDim }}>
        <Text style={{ fontFamily: font.bodyBold, color: t.text }}>Simulazione educativa. </Text>
        Prezzi reali, SONAR COIN finti. Non è un consiglio di investimento: i risultati passati non garantiscono quelli futuri e
        investire soldi veri comporta un rischio di perdita alto.
      </Text>
    </View>
  );
}

const textVariants: Record<string, TextStyle> = {
  h1: { fontFamily: font.displayHeavy, fontSize: 30, letterSpacing: -0.6 },
  h2: { fontFamily: font.display, fontSize: 22, letterSpacing: -0.3 },
  h3: { fontFamily: font.display, fontSize: 17, letterSpacing: -0.2 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 21 },
  bodyBold: { fontFamily: font.bodyBold, fontSize: 15 },
  small: { fontFamily: font.bodySemi, fontSize: 13 },
  label: { fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  num: { fontFamily: font.display, fontSize: 15 },
};

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: space.xl,
  },
  btnRim: { borderRadius: radius.lg, borderWidth: 1 },
  btnText: { fontFamily: font.display, fontSize: 16, letterSpacing: 0.4 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: space.xl,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  heroRim: { borderRadius: radius.xl, borderWidth: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xl,
    marginBottom: space.md,
  },
  disclaimer: { borderRadius: radius.md, borderWidth: 1, padding: space.md },
});
