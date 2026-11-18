import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Backdrop } from '@/components/screen';
import { SonarLogo } from '@/components/sonar-logo';
import { Bouncy, Card, Disclaimer, SectionTitle, Txt } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, palettes, radius, space, type ThemeName } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const THEMES: { id: ThemeName; name: string; desc: string }[] = [
  { id: 'diamond', name: 'Diamante', desc: 'Bianco e diamante' },
  { id: 'gold', name: 'Notte Oro', desc: 'Nero e oro' },
];

export default function Settings() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { theme, setTheme, plan, referralCode } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Backdrop />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Bouncy onPress={() => router.back()}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="back" size={20} color={t.text} />
            </View>
          </Bouncy>
          <Txt variant="h2">Impostazioni</Txt>
        </View>

        <SectionTitle title="Tema" />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          {THEMES.map((th) => {
            const p = palettes[th.id];
            const sel = theme === th.id;
            return (
              <Bouncy
                key={th.id}
                style={{ flex: 1 }}
                onPress={() => {
                  haptic.select();
                  setTheme(th.id);
                }}>
                <View style={{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: sel ? t.accent : t.border }}>
                  <View style={{ height: 130, alignItems: 'center', justifyContent: 'center' }}>
                    <LinearGradient colors={th.id === 'diamond' ? p.bgGradient : p.hero} style={StyleSheet.absoluteFill} />
                    <SonarLogo size={58} colors={p.gem} facet={th.id === 'gold' ? 'rgba(20,15,4,0.35)' : 'rgba(255,255,255,0.75)'} />
                  </View>
                  <View style={{ padding: space.md, backgroundColor: t.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Txt variant="bodyBold">{th.name}</Txt>
                      <Txt variant="small">{th.desc}</Txt>
                    </View>
                    {sel && <Icon name="check" size={18} color={t.accent} stroke={3} />}
                  </View>
                </View>
              </Bouncy>
            );
          })}
        </View>

        <SectionTitle title="Account" />
        <Card style={{ gap: space.md }}>
          <Row label="Piano" value={plan?.toUpperCase() ?? '—'} onPress={() => router.push('/plans')} />
          <Row label="Codice invito" value={referralCode} />
        </Card>

        <SectionTitle title="Note legali" />
        <Disclaimer />
        <Txt variant="small" style={{ marginTop: space.md, fontSize: 11, lineHeight: 16 }}>
          I SONAR COIN sono una valuta virtuale senza valore monetario: non si possono prelevare né convertire in denaro. I
          segnali del RADAR descrivono dati oggettivi dei grafici e sono uguali per tutti gli utenti.
        </Txt>
        <Text style={{ fontFamily: font.body, fontSize: 11, color: t.textFaint, textAlign: 'center', marginTop: space.xxl }}>
          SONAR · versione prototipo 0.1
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Bouncy onPress={onPress} scaleTo={0.98}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt>{label}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Txt variant="bodyBold">{value}</Txt>
          {onPress && <Icon name="chevron" size={16} color={t.textFaint} />}
        </View>
      </View>
    </Bouncy>
  );
}
