import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetBadge } from '@/components/asset-row';
import { RollingNumber, Sparkline } from '@/components/charts';
import { CoinAmount, CoinGlyph } from '@/components/coin';
import { Icon } from '@/components/icon';
import { Backdrop } from '@/components/screen';
import { Bouncy, Card, Disclaimer, GemButton, Pill, Txt } from '@/components/ui';
import { COSTS } from '@/data/assets';
import { PATTERNS, scanSignals } from '@/data/signals';
import { formatPct, formatPrice, formatSC } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { CHART_LEN, useMarket, useMarketMeta } from '@/store/market';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const AMOUNTS = [50, 100, 250, 500];

export default function AssetDetail() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const market = useMarket();
  const { stats } = useMarketMeta();
  const { balance, dispatch } = useApp();
  const q = market[symbol ?? ''];
  const [amount, setAmount] = useState(100);
  const [done, setDone] = useState(false);

  if (!q) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <Txt>Titolo non trovato</Txt>
      </View>
    );
  }

  const up = q.change >= 0;
  const sig = scanSignals([q])[0] ?? null;
  const pat = sig ? PATTERNS[sig.pattern] : null;
  const st = sig ? stats[sig.pattern] : null;
  const live = !q.asset.simulated;
  const costs = COSTS[q.asset.kind];
  const fee = amount * costs.fee;
  const spread = amount * costs.spread / 2;
  const canBuy = amount > 0 && amount <= balance;

  const buy = () => {
    dispatch({ type: 'buy', symbol: q.asset.symbol, amount, price: q.price });
    haptic.success();
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Backdrop />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, gap: 12 }}>
          <Bouncy onPress={() => router.back()}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="back" size={20} color={t.text} />
            </View>
          </Bouncy>
          <AssetBadge asset={q.asset} size={40} />
          <View style={{ flex: 1 }}>
            <Txt variant="h3">{q.asset.name}</Txt>
            <Txt variant="small">
              {q.asset.symbol} · {q.asset.kind === 'crypto' ? 'Crypto' : 'Azione'}
            </Txt>
          </View>
          <Pill
            label={live ? 'LIVE' : 'DEMO'}
            color={live ? t.up : '#F5A524'}
            bg={live ? t.upSoft : 'rgba(245,165,36,0.14)'}
            icon={<View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: live ? t.up : '#F5A524' }} />}
          />
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: space.xl }}>
          <RollingNumber value={q.price} format={formatPrice} style={{ fontSize: 40, letterSpacing: -1.2, color: t.text, fontFamily: font.displayHeavy }} />
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: up ? t.up : t.down, marginTop: 2 }}>
            {up ? '▲' : '▼'} {formatPct(q.change)} oggi
          </Text>
        </View>

        <View style={{ marginTop: space.lg }}>
          <Sparkline values={q.history.slice(-CHART_LEN)} width={width} height={200} color={up ? t.up : t.down} dot strokeWidth={2.5} />
        </View>

        <View style={{ paddingHorizontal: space.lg, gap: space.md, marginTop: space.lg }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="radar" size={18} color={t.accent} />
              <Txt variant="label">Cosa vede il radar</Txt>
            </View>
            {pat && sig && st ? (
              <>
                <Txt variant="h3" style={{ marginTop: 8 }}>
                  {pat.label}
                </Txt>
                <Txt variant="small" style={{ marginTop: 6, lineHeight: 19 }}>
                  In passato, dopo questo schema, il prezzo si è mosso {pat.bias === 'up' ? 'al rialzo' : 'al ribasso'} nel{' '}
                  <Text style={{ fontFamily: font.bodyBold, color: t.text }}>{st.winRate}%</Text> dei casi entro {pat.horizon} — e nel{' '}
                  {100 - st.winRate}% dei casi no ({st.samples.toLocaleString('it-IT')} casi{st.measured ? ' misurati sui dati reali' : ' di esempio'}).
                  Forza segnale: {sig.score}/100.
                </Txt>
              </>
            ) : (
              <>
                <Txt variant="h3" style={{ marginTop: 8 }}>
                  Nessuno schema rilevante
                </Txt>
                <Txt variant="small" style={{ marginTop: 6, lineHeight: 19 }}>
                  In questo momento il grafico non mostra rotture, volumi anomali o RSI estremi. Puoi comunque provare in demo.
                </Txt>
              </>
            )}
          </Card>

          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt variant="h3">Prova in demo</Txt>
              <CoinAmount value={balance} size={13} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
              {[...AMOUNTS, Math.floor(balance)].map((a, i) => {
                const sel = a === amount;
                return (
                  <Bouncy key={i} onPress={() => setAmount(a)} style={{ flex: 1 }} scaleTo={0.9}>
                    <View
                      style={{
                        height: 40,
                        borderRadius: radius.sm,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: sel ? t.accent : t.surfaceAlt,
                        borderWidth: 1,
                        borderColor: sel ? t.accent : t.border,
                      }}>
                      <Text style={{ fontFamily: font.display, fontSize: 13, color: sel ? (t.dark ? '#140F04' : '#fff') : t.text }}>
                        {i === AMOUNTS.length ? 'Tutto' : a}
                      </Text>
                    </View>
                  </Bouncy>
                );
              })}
            </View>
            <View style={{ marginTop: space.md, gap: 6 }}>
              <Row label="Importo" value={`${formatSC(amount)} SC`} />
              <Row label={`Commissione (${(costs.fee * 100).toFixed(2)}%)`} value={`−${formatSC(fee)} SC`} />
              <Row label="Spread stimato" value={`−${formatSC(spread)} SC`} />
            </View>
            <Txt variant="small" style={{ fontSize: 11, marginTop: 8, color: t.textFaint }}>
              Costi realistici: il risultato è lo stesso che avresti con soldi veri.
            </Txt>
            <GemButton
              style={{ marginTop: space.lg }}
              title={canBuy ? `Investi ${formatSC(amount, 0)} SONAR COIN` : 'Saldo insufficiente'}
              disabled={!canBuy}
              icon={<CoinGlyph size={20} />}
              onPress={buy}
            />
          </Card>
          <Disclaimer compact />
        </View>
      </ScrollView>

      {done && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,8,20,0.55)' }}>
          <Animated.View entering={ZoomIn.springify().damping(10)} style={{ alignItems: 'center', gap: 12 }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.up, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={52} color="#fff" stroke={3.2} />
            </View>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 22, color: '#fff' }}>Posizione aperta!</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt variant="small">{label}</Txt>
      <Txt variant="small">{value}</Txt>
    </View>
  );
}
