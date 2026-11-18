import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinGlyph } from '@/components/coin';
import { Icon, type IconName } from '@/components/icon';
import { SonarLogo } from '@/components/sonar-logo';
import { GemButton, Shine } from '@/components/ui';
import { TRIAL_DAYS, WELCOME_COINS } from '@/data/plans';
import { formatSC } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SLIDES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'up',
    title: 'Mercati veri.\nZero rischio.',
    text: 'Prezzi reali di crypto e azioni, al secondo. Tu investi SONAR COIN: guadagni e perdite identici ai soldi veri.',
  },
  {
    icon: 'radar',
    title: 'Il RADAR scansiona\nper te.',
    text: 'Migliaia di grafici analizzati in tempo reale. Vedi i segnali più forti, con le statistiche vere — vittorie e sconfitte.',
  },
  {
    icon: 'trophy',
    title: 'Impara giocando.\nSfida gli amici.',
    text: 'Livelli, lezioni, tornei e ricompense. Diventa bravo prima di rischiare un solo euro.',
  },
];

function Check({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}>
      <View style={[styles.checkBox, { borderColor: t.heroGem[2], backgroundColor: checked ? t.heroGem[1] : 'transparent' }]}>
        {checked && <Icon name="check" size={14} color="#0B1230" stroke={3} />}
      </View>
      <Text style={[styles.checkText, { color: t.heroDim }]}>{label}</Text>
    </Pressable>
  );
}

export default function Onboarding() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { startTrial } = useApp();
  const [page, setPage] = useState(0);
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const scroller = useRef<ScrollViewInstance>(null);
  const last = page === SLIDES.length;

  const next = () => {
    if (last) {
      haptic.success();
      startTrial();
      return;
    }
    scroller.current?.scrollTo({ x: (page + 1) * width, animated: true });
    setPage(page + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, { backgroundColor: t.heroGem[2], top: -120, right: -140 }]} />
      <View style={[styles.orb, { backgroundColor: t.heroGem[3] ?? t.heroGem[1], bottom: -160, left: -160 }]} />

      <View style={{ paddingTop: insets.top + space.xxl, alignItems: 'center' }}>
        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <SonarLogo size={96} colors={t.heroGem} facet="rgba(11,18,48,0.35)" ping wordmark />
        </Animated.View>
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flexGrow: 0, marginTop: space.xxl }}>
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width, paddingHorizontal: space.xxl }}>
            <View style={[styles.slideIcon, { borderColor: t.heroGem[2] + '66' }]}>
              <Icon name={s.icon} size={26} color={t.heroGem[1]} stroke={2.2} />
            </View>
            <Text style={[styles.title, { color: t.heroText }]}>{s.title}</Text>
            <Text style={[styles.text, { color: t.heroDim }]}>{s.text}</Text>
          </View>
        ))}
        <View style={{ width, paddingHorizontal: space.xxl }}>
          <Animated.View entering={FadeIn} style={[styles.giftCard, { borderColor: t.heroGem[2] + '66' }]}>
            <Shine width={300} />
            <Text style={[styles.giftLabel, { color: t.heroDim }]}>REGALO DI BENVENUTO</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <CoinGlyph size={36} colors={t.heroGem} />
              <Text style={[styles.giftNum, { color: t.heroText }]}>{formatSC(WELCOME_COINS, 0)}</Text>
            </View>
            <Text style={[styles.text, { color: t.heroDim, marginTop: 6 }]}>
              SONAR COIN + {TRIAL_DAYS} giorni gratis del piano BASE. Poi decidi tu.
            </Text>
          </Animated.View>
          <View style={{ marginTop: space.xl, gap: 12 }}>
            <Check checked={adult} onPress={() => setAdult(!adult)} label="Ho almeno 18 anni" />
            <Check
              checked={terms}
              onPress={() => setTerms(!terms)}
              label="Ho capito che SONAR è una simulazione educativa: i SONAR COIN non sono soldi veri e non si possono prelevare. Nessun contenuto è un consiglio di investimento."
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.xl }]}>
        <View style={styles.dots}>
          {[...SLIDES, null].map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === page ? t.heroGem[1] : 'rgba(255,255,255,0.22)', width: i === page ? 22 : 7 }]}
            />
          ))}
        </View>
        <Animated.View entering={FadeInDown.delay(300)}>
          <GemButton
            variant="gem"
            title={last ? `Inizia gratis · ${TRIAL_DAYS} giorni` : 'Avanti'}
            disabled={last && !(adult && terms)}
            onPress={next}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 360, height: 360, borderRadius: 180, opacity: 0.16 },
  slideIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: { fontFamily: font.displayHeavy, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  text: { fontFamily: font.body, fontSize: 16, lineHeight: 23, marginTop: space.md },
  giftCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  giftLabel: { fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.6 },
  giftNum: { fontFamily: font.displayHeavy, fontSize: 40, letterSpacing: -1 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkBox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkText: { flex: 1, fontFamily: font.body, fontSize: 13, lineHeight: 18 },
  footer: { marginTop: 'auto', paddingHorizontal: space.xl, gap: space.lg },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 7, borderRadius: 4 },
});
