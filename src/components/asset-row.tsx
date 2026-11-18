import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Sparkline } from '@/components/charts';
import { Bouncy, Txt } from '@/components/ui';
import type { Asset } from '@/data/assets';
import { formatPct, formatPrice } from '@/lib/format';
import type { Quote } from '@/store/market';
import { font } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export function AssetBadge({ asset, size = 40 }: { asset: Asset; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.6,
        backgroundColor: asset.color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: '#fff', fontFamily: font.displayHeavy, fontSize: size * (asset.symbol.length > 3 ? 0.26 : 0.32) }}>
        {asset.symbol.slice(0, 4)}
      </Text>
    </View>
  );
}

export function AssetRow({ quote }: { quote: Quote }) {
  const t = useTheme();
  const up = quote.change >= 0;
  return (
    <Bouncy scaleTo={0.97} onPress={() => router.push(`/asset/${quote.asset.symbol}`)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 }}>
        <AssetBadge asset={quote.asset} />
        <View style={{ flex: 1 }}>
          <Txt variant="bodyBold">{quote.asset.name}</Txt>
          <Txt variant="small">{quote.asset.symbol}</Txt>
        </View>
        <Sparkline values={quote.history.slice(-40)} width={64} height={28} color={up ? t.up : t.down} fill={false} />
        <View style={{ alignItems: 'flex-end', minWidth: 92 }}>
          <Txt variant="num">{formatPrice(quote.price)}</Txt>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: up ? t.up : t.down }}>{formatPct(quote.change)}</Text>
        </View>
      </View>
    </Bouncy>
  );
}
