import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { RankBadge } from '@/components/rank-badge';
import { Backdrop } from '@/components/screen';
import { Bouncy, Card, Pill, SectionTitle, Shine, Txt } from '@/components/ui';
import { nextTier, SAMPLE_LEADERBOARD, tierOf, tierProgress, TIERS } from '@/data/ranks';
import { formatPct } from '@/lib/format';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

function Halo({ color }: { color: string }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1);
  }, [r]);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute', width: 230, height: 230 }, st]} pointerEvents="none">
      <LinearGradient colors={[color, 'transparent', color, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 115, opacity: 0.45 }} />
    </Animated.View>
  );
}

export default function Ranked() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { rating, bestRating, closedTrades, wins, trades } = useApp();
  const tier = tierOf(rating);
  const next = nextTier(rating);
  const prog = tierProgress(rating);
  const winRate = closedTrades ? (wins / closedTrades) * 100 : 0;
  const recent = trades.filter((x) => x.side === 'sell' && x.srChange !== undefined).slice(0, 5);

  const board = [...SAMPLE_LEADERBOARD, { name: 'Tu', sr: rating }].sort((a, b) => b.sr - a.sr);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Backdrop />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Bouncy onPress={() => router.back()} accessibilityLabel="Indietro">
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="back" size={20} color={t.text} />
            </View>
          </Bouncy>
          <Txt variant="h2">Ranked</Txt>
          <View style={{ flex: 1 }} />
          <Pill label="Stagione 1" color={t.textDim} bg={t.surface} />
        </View>

        <View style={{ marginTop: space.lg, borderRadius: radius.xl, overflow: 'hidden', padding: space.xl, alignItems: 'center' }}>
          <LinearGradient colors={['#0A0F2A', '#141B45', '#0A0F2A']} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={[tier.glow, 'transparent']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.9 }} style={StyleSheet.absoluteFill} />
          <Shine width={420} period={5200} />
          <View style={{ width: 230, height: 230, alignItems: 'center', justifyContent: 'center' }}>
            <Halo color={tier.colors[1]} />
            <Animated.View entering={ZoomIn.springify().damping(10)}>
              <RankBadge tier={tier} size={180} />
            </Animated.View>
          </View>
          <Text style={{ fontFamily: font.displayHeavy, fontSize: 34, color: '#fff', letterSpacing: -0.5 }}>{tier.name}</Text>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: tier.colors[0], marginTop: 2 }}>{tier.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: space.lg }}>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 28, color: '#fff' }}>{rating}</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: 'rgba(220,232,255,0.7)' }}>SR</Text>
          </View>
          <View style={{ alignSelf: 'stretch', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: space.md, overflow: 'hidden' }}>
            <LinearGradient colors={tier.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(4, prog * 100)}%`, height: '100%' }} />
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: 'rgba(220,232,255,0.7)', marginTop: 8 }}>
            {next ? `${next.min - rating} SR per diventare ${next.name}` : 'Hai raggiunto il grado più alto'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg }}>
          {[
            { l: 'Operazioni', v: String(closedTrades) },
            { l: 'Vincenti', v: closedTrades ? `${winRate.toFixed(0)}%` : '—' },
            { l: 'Record', v: String(bestRating) },
          ].map((x, i) => (
            <Card key={x.l} delay={i * 60} style={{ flex: 1, padding: space.md, alignItems: 'center' }}>
              <Txt variant="label" style={{ fontSize: 10 }}>
                {x.l}
              </Txt>
              <Txt variant="h3" style={{ marginTop: 4 }}>
                {x.v}
              </Txt>
            </Card>
          ))}
        </View>

        <SectionTitle title="Come si sale" />
        <Card>
          <Txt variant="small" style={{ lineHeight: 19 }}>
            Ogni operazione chiusa (minimo 50 SC) sposta il tuo SR in base alla <Text style={{ fontFamily: font.bodyBold, color: t.text }}>percentuale</Text> di
            guadagno o perdita, commissioni comprese. Conta come investi, non quanti SONAR COIN hai: comprarne di più non fa salire di grado.
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md, flexWrap: 'wrap' }}>
            <Pill label="+2% → +50 SR (max 45)" color={t.up} bg={t.upSoft} />
            <Pill label="−1% → −25 SR" color={t.down} bg={t.downSoft} />
          </View>
        </Card>

        <SectionTitle title="I gradi" />
        <Card style={{ paddingVertical: space.sm }}>
          {[...TIERS].reverse().map((x, i) => {
            const mine = x.id === tier.id;
            return (
              <Animated.View
                key={x.id}
                entering={FadeInDown.delay(i * 50)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  marginHorizontal: -8,
                  borderRadius: radius.md,
                  backgroundColor: mine ? t.surfaceAlt : 'transparent',
                  opacity: rating >= x.min || mine ? 1 : 0.55,
                }}>
                <RankBadge tier={x} size={44} />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyBold">{x.name}</Txt>
                  <Txt variant="small">{x.title}</Txt>
                </View>
                <Txt variant="small">{x.min === 0 ? 'inizio' : `${x.min}+ SR`}</Txt>
              </Animated.View>
            );
          })}
        </Card>

        {recent.length > 0 && (
          <>
            <SectionTitle title="Ultime partite" />
            <Card style={{ paddingVertical: space.sm }}>
              {recent.map((r) => (
                <View key={r.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <Txt variant="bodyBold">{r.symbol}</Txt>
                  <Txt variant="small" color={(r.pnlPct ?? 0) >= 0 ? t.up : t.down}>
                    {formatPct(r.pnlPct ?? 0)}
                  </Txt>
                  <Txt variant="bodyBold" color={(r.srChange ?? 0) >= 0 ? t.up : t.down}>
                    {(r.srChange ?? 0) >= 0 ? '+' : ''}
                    {r.srChange} SR
                  </Txt>
                </View>
              ))}
            </Card>
          </>
        )}

        <SectionTitle title="Classifica" action={<Txt variant="small">esempio</Txt>} />
        <Card style={{ paddingVertical: space.sm }}>
          {board.map((p, i) => {
            const me = p.name === 'Tu';
            const pt = tierOf(p.sr);
            return (
              <View
                key={p.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  marginHorizontal: -8,
                  borderRadius: radius.md,
                  backgroundColor: me ? t.surfaceAlt : 'transparent',
                }}>
                <Text style={{ width: 22, fontFamily: font.displayHeavy, fontSize: 14, color: i < 3 ? t.accent : t.textFaint }}>{i + 1}</Text>
                <RankBadge tier={pt} size={30} />
                <Txt variant="bodyBold" style={{ flex: 1 }}>
                  {p.name}
                </Txt>
                <Txt variant="num">{p.sr}</Txt>
              </View>
            );
          })}
        </Card>
        <Txt variant="small" style={{ marginTop: space.md, fontSize: 11, lineHeight: 16, color: t.textFaint }}>
          Il grado misura i risultati nella simulazione: è un modo per vedere i tuoi progressi, non una garanzia di risultati con soldi
          veri. La classifica reale arriverà con gli account; i nomi qui sopra sono di esempio.
        </Txt>
      </ScrollView>
    </View>
  );
}
