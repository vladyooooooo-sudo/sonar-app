import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AssetBadge, AssetRow } from '@/components/asset-row';
import { RollingNumber, Sparkline } from '@/components/charts';
import { CoinGlyph } from '@/components/coin';
import { Icon, type IconName } from '@/components/icon';
import { RankBadge } from '@/components/rank-badge';
import { Screen } from '@/components/screen';
import { SonarMark } from '@/components/sonar-logo';
import { Bouncy, Card, Disclaimer, HeroCard, Pill, SectionTitle, Txt } from '@/components/ui';
import { nextTier, tierOf, tierProgress } from '@/data/ranks';
import { formatPct, formatSC } from '@/lib/format';
import { sellValue, useApp } from '@/store/app-store';
import { useMarket } from '@/store/market';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

function QuickAction({ icon, label, onPress, delay }: { icon: IconName; label: string; onPress: () => void; delay: number }) {
  const t = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <Bouncy onPress={onPress}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 20,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name={icon} size={24} color={t.accent} stroke={2.1} />
          </View>
          <Txt variant="small" color={t.text}>
            {label}
          </Txt>
        </View>
      </Bouncy>
    </Animated.View>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.surfaceAlt, borderRadius: radius.pill, padding: 3, borderWidth: 1, borderColor: t.border }}>
      {options.map((o) => (
        <Bouncy key={o} onPress={() => onChange(o)} scaleTo={0.92}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: radius.pill,
              backgroundColor: value === o ? t.surface : 'transparent',
            }}>
            <Txt variant="small" color={value === o ? t.text : t.textDim}>
              {o}
            </Txt>
          </View>
        </Bouncy>
      ))}
    </View>
  );
}

export default function Home() {
  const t = useTheme();
  const market = useMarket();
  const { balance, positions, plan, trialEndsAt, dispatch, rating } = useApp();
  const tier = tierOf(rating);
  const next = nextTier(rating);
  const [filter, setFilter] = useState('Crypto');

  const positionsValue = positions.reduce((s, p) => s + sellValue(p, market[p.symbol].price), 0);
  const cost = positions.reduce((s, p) => s + p.invested, 0);
  const equity = balance + positionsValue;
  const pnl = positionsValue - cost;
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

  const [curve, setCurve] = useState<number[]>([]);
  useEffect(() => {
    setCurve((c) => [...c.slice(-59), equity]);
  }, [equity]);

  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86400000)) : null;

  const list = useMemo(
    () =>
      Object.values(market)
        .filter((q) => (filter === 'Crypto' ? q.asset.kind === 'crypto' : q.asset.kind === 'stock'))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
    [market, filter],
  );

  return (
    <Screen title="Portafoglio" subtitle="SONAR · demo">
      <HeroCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <SonarMark size={26} colors={t.heroGem} facet="rgba(11,18,48,0.3)" />
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, letterSpacing: 1.4, color: t.heroDim }}>VALORE TOTALE</Text>
          </View>
          {daysLeft !== null && (
            <Bouncy onPress={() => router.push('/plans')}>
              <Pill label={`Prova ${plan?.toUpperCase()} · ${daysLeft}g`} color={t.heroText} bg="rgba(255,255,255,0.12)" icon={<Icon name="star" size={12} color={t.heroGem[1]} />} />
            </Bouncy>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space.lg }}>
          <CoinGlyph size={30} colors={t.heroGem} />
          <RollingNumber value={equity} style={{ fontSize: 38, letterSpacing: -1, color: t.heroText, fontFamily: font.displayHeavy }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Pill
            label={`${pnl >= 0 ? '▲' : '▼'} ${formatSC(Math.abs(pnl))} SC · ${formatPct(pnlPct)}`}
            color={pnl >= 0 ? t.up : t.down}
            bg={pnl >= 0 ? t.upSoft : t.downSoft}
          />
          <Text style={{ fontFamily: font.body, fontSize: 12, color: t.heroDim }}>posizioni aperte</Text>
        </View>
        <View style={{ marginTop: space.lg, marginHorizontal: -space.xl, marginBottom: -space.xl }}>
          <Sparkline values={curve.length > 1 ? curve : [equity, equity]} width={420} height={70} color={t.heroGem[2]} />
        </View>
      </HeroCard>

      <View style={{ flexDirection: 'row', marginTop: space.xl }}>
        <QuickAction icon="radar" label="Radar" onPress={() => router.push('/radar')} delay={80} />
        <QuickAction icon="learn" label="Impara" onPress={() => router.push('/impara')} delay={140} />
        <QuickAction icon="trophy" label="Ranked" onPress={() => router.push('/ranked')} delay={200} />
        <QuickAction icon="gift" label="Invita" onPress={() => router.push('/invita')} delay={260} />
      </View>

      <Bouncy onPress={() => router.push('/ranked')} scaleTo={0.97} style={{ marginTop: space.xl }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <RankBadge tier={tier} size={58} />
          <View style={{ flex: 1 }}>
            <Txt variant="label">Il tuo grado</Txt>
            <Txt variant="h3" style={{ marginTop: 2 }}>
              {tier.name} · {rating} SR
            </Txt>
            <Txt variant="small" style={{ marginTop: 2 }}>
              {tier.title}
            </Txt>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: 8, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(4, tierProgress(rating) * 100)}%`, height: '100%', backgroundColor: tier.colors[1] }} />
            </View>
            {next && (
              <Txt variant="small" style={{ fontSize: 11, marginTop: 4 }}>
                {next.min - rating} SR per {next.name}
              </Txt>
            )}
          </View>
          <Icon name="chevron" size={18} color={t.textFaint} />
        </Card>
      </Bouncy>

      <SectionTitle title="Le tue posizioni" action={<Txt variant="small">{positions.length} aperte</Txt>} />
      {positions.length === 0 ? (
        <Card>
          <Txt variant="bodyBold">Nessuna posizione ancora</Txt>
          <Txt variant="small" style={{ marginTop: 4, lineHeight: 18 }}>
            Apri il RADAR, scegli un segnale e prova a investire i tuoi SONAR COIN. Vedrai il risultato in tempo reale.
          </Txt>
        </Card>
      ) : (
        <Card style={{ paddingVertical: 6 }}>
          {positions.map((p, i) => {
            const q = market[p.symbol];
            const v = sellValue(p, q.price);
            const d = v - p.invested;
            return (
              <View
                key={p.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: t.border,
                }}>
                <AssetBadge asset={q.asset} size={36} />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyBold">{q.asset.name}</Txt>
                  <Txt variant="small">Investiti {formatSC(p.invested)} SC</Txt>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Txt variant="num">{formatSC(v)}</Txt>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: d >= 0 ? t.up : t.down }}>
                    {d >= 0 ? '+' : ''}
                    {formatSC(d)} SC
                  </Text>
                </View>
                <Bouncy onPress={() => dispatch({ type: 'sell', id: p.id, price: q.price })}>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: t.surfaceAlt, borderWidth: 1, borderColor: t.border }}>
                    <Txt variant="small" color={t.text}>
                      Vendi
                    </Txt>
                  </View>
                </Bouncy>
              </View>
            );
          })}
        </Card>
      )}

      <SectionTitle title="Mercati live" action={<Segmented value={filter} onChange={setFilter} options={['Crypto', 'Azioni']} />} />
      <Card style={{ paddingVertical: 4 }}>
        {list.slice(0, 8).map((q) => (
          <AssetRow key={q.asset.symbol} quote={q} />
        ))}
      </Card>

      <View style={{ marginTop: space.xl }}>
        <Disclaimer compact />
      </View>
    </Screen>
  );
}
