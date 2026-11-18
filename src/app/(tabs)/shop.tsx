import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CoinGlyph } from '@/components/coin';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Bouncy, HeroCard, SectionTitle, Shine, Txt } from '@/components/ui';
import { COIN_PACKS, PLANS, SKINS } from '@/data/plans';
import { formatSC } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

function CoinStack({ count }: { count: number }) {
  const t = useTheme();
  return (
    <View style={{ height: 64, width: 84, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', left: 14 + ((i * 17) % 40), top: 6 + ((i * 11) % 22), transform: [{ rotate: `${i * 12 - 10}deg` }] }}>
          <CoinGlyph size={30 + (i % 2) * 6} colors={t.gem} />
        </View>
      ))}
    </View>
  );
}

export default function Shop() {
  const t = useTheme();
  const { dispatch, ownedSkins, balance, plan } = useApp();

  return (
    <Screen title="Shop" subtitle="SONAR COIN · skin · piani">
      <Bouncy onPress={() => router.push('/plans')} scaleTo={0.97}>
        <HeroCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.4, color: t.heroDim }}>
                IL TUO PIANO · {plan?.toUpperCase() ?? '—'}
              </Text>
              <Text style={{ fontFamily: font.displayHeavy, fontSize: 22, color: t.heroText, marginTop: 4 }}>Passa a PRO</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: t.heroDim, marginTop: 4 }}>
                {formatSC(PLANS[2].monthlyCoins, 0)} SC al mese, analisi IA dei tuoi errori, tutte le lezioni.
              </Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron" size={22} color={t.heroText} />
            </View>
          </View>
        </HeroCard>
      </Bouncy>

      <SectionTitle title="Pacchetti SONAR COIN" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {COIN_PACKS.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(i * 70).springify()} style={{ width: '47.8%' }}>
            <Bouncy
              onPress={() => {
                haptic.success();
                dispatch({ type: 'addCoins', coins: p.coins });
              }}>
              <View
                style={{
                  borderRadius: radius.lg,
                  borderWidth: p.best ? 2 : 1,
                  borderColor: p.best ? t.accent : t.border,
                  backgroundColor: t.surface,
                  padding: space.lg,
                  alignItems: 'center',
                  overflow: 'hidden',
                }}>
                {p.best && <Shine width={200} />}
                {p.bonus && (
                  <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: p.best ? t.accent : t.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontFamily: font.bodyHeavy, fontSize: 10, color: p.best ? (t.dark ? '#140F04' : '#fff') : t.text }}>{p.bonus}</Text>
                  </View>
                )}
                <CoinStack count={i + 1} />
                <Text style={{ fontFamily: font.displayHeavy, fontSize: 20, color: t.text, marginTop: 4 }}>{formatSC(p.coins, 0)}</Text>
                <Txt variant="small">SONAR COIN</Txt>
                <View style={{ marginTop: space.md, alignSelf: 'stretch', height: 38, borderRadius: radius.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                  <LinearGradient colors={t.primary} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                  <Text style={{ fontFamily: font.display, fontSize: 14, color: t.onPrimary }}>{p.price}</Text>
                </View>
              </View>
            </Bouncy>
          </Animated.View>
        ))}
      </View>

      <SectionTitle title="Skin dell'app" action={<Txt variant="small">si pagano in SC</Txt>} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.lg }} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}>
        {SKINS.map((s) => {
          const owned = ownedSkins.includes(s.id);
          const afford = balance >= s.price;
          return (
            <Bouncy key={s.id} onPress={() => !owned && afford && dispatch({ type: 'buySkin', id: s.id, price: s.price })}>
              <View style={{ width: 150, height: 196, borderRadius: radius.lg, overflow: 'hidden', padding: space.md, justifyContent: 'flex-end' }}>
                <LinearGradient colors={s.colors as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Shine width={180} delay={s.price} />
                <Text style={{ fontFamily: font.displayHeavy, fontSize: 18, color: '#fff' }}>{s.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 }}>
                  {owned ? <Icon name="check" size={13} color="#fff" stroke={3} /> : <CoinGlyph size={14} colors={['#fff', '#dfe8ff', '#b9c8ff']} />}
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: '#fff' }}>{owned ? 'Tua' : formatSC(s.price, 0)}</Text>
                </View>
              </View>
            </Bouncy>
          );
        })}
      </ScrollView>

      <Txt variant="small" style={{ marginTop: space.xl, fontSize: 11, lineHeight: 16, color: t.textFaint }}>
        I SONAR COIN sono una valuta virtuale valida solo dentro SONAR: non hanno valore monetario, non si possono prelevare né
        convertire in denaro. Prototipo: gli acquisti sono simulati.
      </Txt>
    </Screen>
  );
}
