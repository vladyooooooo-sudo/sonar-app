import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AssetBadge } from '@/components/asset-row';
import { Icon } from '@/components/icon';
import { RadarScope } from '@/components/radar-scope';
import { Screen } from '@/components/screen';
import { Bouncy, Disclaimer, HeroCard, Pill, SectionTitle, Txt } from '@/components/ui';
import { PATTERNS, scanSignals, type Signal } from '@/data/signals';
import { formatPrice } from '@/lib/format';
import { useMarket, useMarketMeta } from '@/store/market';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

function ScoreRing({ score, color, track }: { score: number; color: string; track: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}>
      <View style={{ position: 'absolute', width: 52, height: 52, borderRadius: 26, borderWidth: 4, borderColor: track }} />
      <View
        style={{
          position: 'absolute',
          width: 52,
          height: 52,
          borderRadius: 26,
          borderWidth: 4,
          borderColor: color,
          borderBottomColor: score < 75 ? 'transparent' : color,
          borderLeftColor: score < 50 ? 'transparent' : color,
          borderTopColor: score < 25 ? 'transparent' : color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <Text style={{ fontFamily: font.displayHeavy, fontSize: 15, color }}>{score}</Text>
    </View>
  );
}

function SignalCard({ s, index }: { s: Signal; index: number }) {
  const t = useTheme();
  const q = useMarket()[s.symbol];
  const { stats } = useMarketMeta();
  const p = PATTERNS[s.pattern];
  const st = stats[s.pattern];
  if (!q) return null;
  const up = p.bias === 'up';
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(18)} layout={LinearTransition.springify()}>
      <Bouncy scaleTo={0.97} onPress={() => router.push(`/asset/${s.symbol}`)}>
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: t.border,
            padding: space.lg,
            marginBottom: space.md,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AssetBadge asset={q.asset} size={42} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt variant="bodyBold">{q.asset.name}</Txt>
                <Txt variant="small">{q.asset.symbol}</Txt>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                <Pill
                  label={p.short}
                  color={up ? t.up : t.down}
                  bg={up ? t.upSoft : t.downSoft}
                  icon={<Icon name={up ? 'up' : 'down'} size={12} color={up ? t.up : t.down} stroke={2.4} />}
                />
                <Pill label={formatPrice(q.price)} color={t.textDim} bg={t.surfaceAlt} />
              </View>
            </View>
            <ScoreRing score={s.score} color={t.accent} track={t.surfaceAlt} />
          </View>
          <View style={{ flexDirection: 'row', marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.border }}>
            <Stat
              label="Storico"
              color={st.winRate >= 55 ? t.up : st.winRate < 45 ? t.down : undefined}
              value={`${st.winRate}%`} hint={`${st.samples.toLocaleString('it-IT')} casi${st.measured ? ' reali' : ' · esempio'}`} />
            <Stat label="Orizzonte" value={p.horizon} />
            <Stat label="Volume" value={`${s.volumeBoost.toFixed(1)}x`} />
            <Stat label="RSI" value={s.rsi.toFixed(0)} />
          </View>
        </View>
      </Bouncy>
    </Animated.View>
  );
}

function Stat({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Txt variant="label" style={{ fontSize: 10 }}>
        {label}
      </Txt>
      <Txt variant="num" color={color} style={{ marginTop: 2 }}>
        {value}
      </Txt>
      {hint && <Text style={{ fontFamily: font.body, fontSize: 10, color: t.textFaint }}>{hint}</Text>}
    </View>
  );
}

export default function Radar() {
  const t = useTheme();
  const market = useMarket();
  const meta = useMarketMeta();
  const { width } = useWindowDimensions();
  // Re-rank every 6s so the list doesn't jump on each price tick.
  // With live data, the radar only ranks live instruments (simulated stocks are excluded).
  const universe = () => Object.values(market).filter((q) => meta.source !== 'live' || !q.asset.simulated);
  const [snapshot, setSnapshot] = useState(() => scanSignals(universe()));
  const [scans, setScans] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScans((n) => n + 1), 6000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    setSnapshot(scanSignals(universe()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans, meta.source]);

  const blips = useMemo(
    () =>
      snapshot.slice(0, 10).map((s, i) => ({
        id: s.symbol,
        angle: (i * 2.39996) % (Math.PI * 2),
        dist: 0.28 + (1 - s.score / 100) * 0.62,
        strong: s.score >= 70,
        label: s.symbol,
      })),
    [snapshot],
  );

  const scope = Math.min(width - space.xl * 2 - space.lg * 2, 300);
  const top = snapshot.slice(0, 10);
  const strong = snapshot.filter((s) => s.score >= 70).length;

  return (
    <Screen title="Radar" subtitle="Scansione live">
      <HeroCard style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between', marginBottom: space.lg }}>
          <View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.4, color: t.heroDim }}>TITOLI ANALIZZATI</Text>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 26, color: t.heroText }}>{meta.scanned || Object.keys(market).length}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.4, color: t.heroDim }}>SEGNALI FORTI</Text>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 26, color: t.heroGem[1] }}>{strong}</Text>
          </View>
        </View>
        <RadarScope
          size={scope}
          ring={t.heroGem[2] + '40'}
          sweep={t.heroGem[1]}
          blipColor={t.heroGem[0]}
          blips={blips}
          onBlipPress={(id) => router.push(`/asset/${id}`)}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.lg }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: meta.source === 'live' ? t.up : '#F5A524' }} />
          <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: t.heroDim }}>
            {meta.source === 'live'
              ? `Live Binance · nuova scansione ogni 6s · #${scans + 1}`
              : meta.source === 'loading'
                ? 'Collegamento ai mercati…'
                : 'DEMO · prezzi simulati (mercati non raggiungibili)'}
          </Text>
        </View>
      </HeroCard>

      <SectionTitle title="Segnali più forti" action={<Txt variant="small">uguali per tutti</Txt>} />
      {top.map((s, i) => (
        <SignalCard key={s.symbol} s={s} index={i} />
      ))}

      <View style={{ marginTop: space.sm }}>
        <Disclaimer />
      </View>
      <Txt variant="small" style={{ marginTop: space.md, fontSize: 11, lineHeight: 16, color: t.textFaint }}>
        I segnali descrivono fatti misurabili sui grafici (volume, RSI, rotture di livello). Le percentuali "Storico" indicano quante
        volte, in passato, il prezzo si è mosso nella direzione del segnale entro l'orizzonte indicato.
      </Txt>
    </Screen>
  );
}
