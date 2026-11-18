import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinAmount } from '@/components/coin';
import { Icon } from '@/components/icon';
import { Bouncy, Txt } from '@/components/ui';
import { useApp } from '@/store/app-store';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export const TAB_BAR_SPACE = 120;

export function Backdrop() {
  const t = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={t.bgGradient} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, { backgroundColor: t.glow, top: -140, right: -120 }]} />
      <View style={[styles.orb, { backgroundColor: t.glow, bottom: 80, left: -180, opacity: 0.18 }]} />
    </View>
  );
}

export function BalanceChip() {
  const t = useTheme();
  const { balance } = useApp();
  return (
    <Bouncy onPress={() => router.push('/shop')}>
      <View style={[styles.chip, { backgroundColor: t.surface, borderColor: t.border }]}>
        <CoinAmount value={balance} size={14} />
        <View style={[styles.plus, { backgroundColor: t.accent }]}>
          <Txt variant="bodyBold" color={t.dark ? '#140F04' : '#fff'} style={{ fontSize: 14, lineHeight: 16 }}>
            +
          </Txt>
        </View>
      </View>
    </Bouncy>
  );
}

export function Screen({
  title,
  subtitle,
  children,
  right,
  scroll = true,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const header = title ? (
    <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
      <View style={{ flex: 1 }}>
        {subtitle && <Txt variant="label">{subtitle}</Txt>}
        <Txt variant="h1">{title}</Txt>
      </View>
      {right ?? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <BalanceChip />
          <Bouncy onPress={() => router.push('/settings')} accessibilityLabel="Impostazioni">
            <View style={[styles.iconBtn, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Icon name="settings" size={18} color={t.textDim} />
            </View>
          </Bouncy>
        </View>
      )}
    </View>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Backdrop />
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
          showsVerticalScrollIndicator={false}>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: space.lg }}>
          {header}
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 380, height: 380, borderRadius: 190, opacity: 0.28 },
  header: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: space.lg, gap: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 10,
    paddingRight: 5,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  plus: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
