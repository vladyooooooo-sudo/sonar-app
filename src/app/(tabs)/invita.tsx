import { LinearGradient } from 'expo-linear-gradient';
import { Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CoinGlyph } from '@/components/coin';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Bouncy, Card, GemButton, HeroCard, SectionTitle, Shine, Txt } from '@/components/ui';
import { REFERRAL_GOAL, REFERRAL_REWARD } from '@/data/plans';
import { formatSC } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const STEPS = [
  { n: '1', title: 'Condividi il tuo codice', text: 'Mandalo su WhatsApp, Instagram o dove vuoi.' },
  { n: '2', title: 'Il tuo amico si iscrive', text: 'Riceve anche lui SONAR COIN extra di benvenuto.' },
  { n: '3', title: `Ricevi ${REFERRAL_REWARD} SC`, text: 'Per ogni amico. Al 5° sblocchi la cassa Diamante.' },
];

export default function Invita() {
  const t = useTheme();
  const { referralCode, referrals, dispatch } = useApp();
  const share = async () => {
    haptic.press();
    try {
      await Share.share({
        message: `Allenati a investire sui mercati veri senza rischiare un euro. Scarica SONAR e usa il mio codice ${referralCode} per avere SONAR COIN extra!`,
      });
    } catch {}
  };

  return (
    <Screen title="Invita" subtitle="Amici = SONAR COIN">
      <HeroCard style={{ alignItems: 'center' }}>
        <Animated.View entering={ZoomIn.springify().damping(10)}>
          <View style={{ width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <LinearGradient colors={t.heroGem} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Shine width={120} />
            <Icon name="gift" size={46} color="#0B1230" stroke={2} />
          </View>
        </Animated.View>
        <Text style={{ fontFamily: font.displayHeavy, fontSize: 26, color: t.heroText, marginTop: space.lg, textAlign: 'center' }}>
          +{REFERRAL_REWARD} SC per ogni amico
        </Text>
        <Text style={{ fontFamily: font.body, fontSize: 14, color: t.heroDim, marginTop: 6, textAlign: 'center' }}>
          SONAR COIN demo, da usare nell&apos;app.
        </Text>

        <Bouncy onPress={share} style={{ alignSelf: 'stretch' }}>
          <View style={{ marginTop: space.xl, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.heroGem[2], paddingVertical: space.lg, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.4, color: t.heroDim }}>IL TUO CODICE</Text>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 28, letterSpacing: 3, color: t.heroText, marginTop: 4 }}>{referralCode}</Text>
          </View>
        </Bouncy>
      </HeroCard>

      <GemButton style={{ marginTop: space.xl }} title="Condividi il codice" icon={<Icon name="share" size={20} color={t.onPrimary} />} onPress={share} />

      <SectionTitle title="La tua cassa Diamante" action={<Txt variant="small">{Math.min(referrals, REFERRAL_GOAL)}/{REFERRAL_GOAL}</Txt>} />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {Array.from({ length: REFERRAL_GOAL }).map((_, i) => {
            const got = i < referrals;
            return (
              <Animated.View key={i} entering={FadeInDown.delay(i * 60)} style={{ alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: got ? t.upSoft : t.surfaceAlt,
                    borderWidth: 1.5,
                    borderColor: got ? t.up : t.border,
                  }}>
                  {got ? <Icon name="check" size={22} color={t.up} stroke={3} /> : <CoinGlyph size={24} />}
                </View>
                <Txt variant="small" style={{ fontSize: 11 }}>
                  +{REFERRAL_REWARD}
                </Txt>
              </Animated.View>
            );
          })}
        </View>
        <Txt variant="small" style={{ marginTop: space.md, lineHeight: 18 }}>
          Al 5° amico si apre la <Text style={{ fontFamily: font.bodyBold, color: t.text }}>cassa Diamante</Text>: una skin
          esclusiva + {formatSC(2500, 0)} SC bonus.
        </Txt>
        <Bouncy onPress={() => dispatch({ type: 'fakeReferral' })}>
          <Txt variant="small" color={t.accent} style={{ marginTop: space.md }}>
            (Prototipo) Simula un amico iscritto →
          </Txt>
        </Bouncy>
      </Card>

      <SectionTitle title="Come funziona" />
      <Card style={{ gap: space.lg }}>
        {STEPS.map((s) => (
          <View key={s.n} style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: t.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: font.displayHeavy, color: t.accent }}>{s.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyBold">{s.title}</Txt>
              <Txt variant="small" style={{ marginTop: 2 }}>
                {s.text}
              </Txt>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
