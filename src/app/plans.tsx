import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinGlyph } from '@/components/coin';
import { Icon } from '@/components/icon';
import { Backdrop } from '@/components/screen';
import { SonarLogo } from '@/components/sonar-logo';
import { Bouncy, GemButton, Shine, Txt } from '@/components/ui';
import { PLANS, TRIAL_DAYS } from '@/data/plans';
import { formatSC } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function Plans() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { plan, trialEndsAt, dispatch } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Backdrop />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xxl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Bouncy onPress={() => router.back()}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={18} color={t.text} />
            </View>
          </Bouncy>
        </View>
        <View style={{ alignItems: 'center', marginTop: -space.md }}>
          <SonarLogo size={64} colors={t.gem} ping />
          <Txt variant="h1" style={{ marginTop: space.lg, textAlign: 'center' }}>
            Scegli il tuo piano
          </Txt>
          <Txt style={{ marginTop: 6, textAlign: 'center', color: t.textDim }}>
            Il RADAR è uguale per tutti. Più sali, più impari e più SONAR COIN ricevi.
          </Txt>
        </View>

        <View style={{ gap: space.lg, marginTop: space.xl }}>
          {PLANS.map((p, i) => {
            const current = plan === p.id;
            const hl = p.highlight;
            return (
              <Animated.View key={p.id} entering={FadeInDown.delay(i * 90).springify().damping(16)}>
                <View
                  style={{
                    borderRadius: radius.xl,
                    padding: space.xl,
                    overflow: 'hidden',
                    borderWidth: hl ? 0 : 1,
                    borderColor: t.border,
                    backgroundColor: hl ? undefined : t.surface,
                  }}>
                  {hl && <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
                  {hl && <Shine width={420} />}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontFamily: font.displayHeavy, fontSize: 24, letterSpacing: 1, color: hl ? t.heroText : t.text }}>{p.name}</Text>
                      <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: hl ? t.heroDim : t.textDim }}>{p.tagline}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: font.displayHeavy, fontSize: 24, color: hl ? t.heroText : t.text }}>{p.price}</Text>
                      <Text style={{ fontFamily: font.body, fontSize: 12, color: hl ? t.heroDim : t.textDim }}>al mese</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.lg }}>
                    <CoinGlyph size={26} colors={hl ? t.heroGem : t.gem} />
                    <Text style={{ fontFamily: font.displayHeavy, fontSize: 20, color: hl ? t.heroText : t.text }}>
                      {formatSC(p.monthlyCoins, 0)} SC
                    </Text>
                    <Text style={{ fontFamily: font.body, fontSize: 13, color: hl ? t.heroDim : t.textDim }}>ogni mese</Text>
                  </View>
                  <View style={{ gap: 8, marginTop: space.lg }}>
                    {p.perks.slice(1).map((perk) => (
                      <View key={perk} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Icon name="check" size={16} color={hl ? t.heroGem[1] : t.accent} stroke={2.6} />
                        <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: hl ? t.heroText : t.text }}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                  <GemButton
                    style={{ marginTop: space.xl }}
                    variant={hl ? 'gem' : 'primary'}
                    title={
                      current && !trialEndsAt
                        ? 'Piano attuale'
                        : p.id === 'base' && trialEndsAt
                          ? `In prova · ${TRIAL_DAYS} giorni gratis`
                          : `Attiva ${p.name}`
                    }
                    disabled={current && !trialEndsAt}
                    onPress={() => {
                      haptic.success();
                      dispatch({ type: 'subscribe', plan: p.id, coins: p.monthlyCoins });
                      router.back();
                    }}
                  />
                </View>
              </Animated.View>
            );
          })}
        </View>
        <Txt variant="small" style={{ marginTop: space.xl, fontSize: 11, lineHeight: 16, color: '#8C93AE', textAlign: 'center' }}>
          Prova gratuita di {TRIAL_DAYS} giorni sul piano BASE, poi rinnovo mensile. Disdici quando vuoi dalle impostazioni dello
          store. SONAR è una simulazione educativa: nessun contenuto è un consiglio di investimento.
        </Txt>
      </ScrollView>
    </View>
  );
}
