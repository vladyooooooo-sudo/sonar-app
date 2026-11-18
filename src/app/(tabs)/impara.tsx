import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CoinGlyph } from '@/components/coin';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Bouncy, GemButton, HeroCard, Pill, Txt } from '@/components/ui';
import { coinsForSeason, levelFromXp, SEASONS, xpForSeason, type Lesson, type Season } from '@/data/lessons';
import type { PlanId } from '@/data/plans';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const PLAN_RANK: Record<PlanId, number> = { base: 0, medio: 1, pro: 2 };

type NodeState = 'done' | 'current' | 'open' | 'locked';

function Node({ lesson, state, offset, onPress, index }: { lesson: Lesson; state: NodeState; offset: number; onPress: () => void; index: number }) {
  const t = useTheme();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (state === 'current') bob.value = withRepeat(withSequence(withTiming(-6, { duration: 700 }), withTiming(0, { duration: 700 })), -1);
    else bob.value = 0;
  }, [state, bob]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const active = state === 'current' || state === 'open';
  const size = state === 'current' ? 84 : 72;
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ alignItems: 'center', transform: [{ translateX: offset }] }}>
      <Animated.View style={st}>
        <Bouncy onPress={onPress} scaleTo={0.88} accessibilityLabel={lesson.title}>
          <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
            {state === 'done' || active ? (
              <LinearGradient
                colors={state === 'done' ? t.gem : t.dark ? t.primary : t.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: t.surfaceAlt, borderWidth: 2, borderColor: t.border }]} />
            )}
            <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderBottomWidth: 6, borderColor: 'rgba(0,0,0,0.18)' }]} />
            <Icon
              name={state === 'done' ? 'check' : state === 'locked' ? 'lock' : lesson.icon}
              size={state === 'current' ? 34 : 28}
              color={state === 'locked' ? t.textFaint : state === 'done' ? '#0B1230' : t.dark ? '#140F04' : '#fff'}
              stroke={2.4}
            />
          </View>
        </Bouncy>
      </Animated.View>
      <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: state === 'locked' ? t.textFaint : t.text, marginTop: 8 }}>{lesson.title}</Text>
    </Animated.View>
  );
}

function LessonSheet({ lesson, season, onClose }: { lesson: Lesson; season: Season; onClose: () => void }) {
  const t = useTheme();
  const { dispatch, completedLessons } = useApp();
  const [picked, setPicked] = useState<number | null>(null);
  // remember whether it was already done when the sheet opened (the store updates on the right answer)
  const [done] = useState(() => completedLessons.includes(lesson.id));
  const right = picked === lesson.correct;
  const coins = coinsForSeason(season.n);
  const xp = xpForSeason(season.n);
  const shake = useSharedValue(0);
  const shakeSt = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const choose = (i: number) => {
    if (picked !== null && picked === lesson.correct) return;
    setPicked(i);
    if (i === lesson.correct) {
      haptic.success();
      dispatch({ type: 'completeLesson', id: lesson.id, xp, coins: done ? 0 : coins });
    } else {
      haptic.press();
      shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withSpring(0));
    }
  };

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} style={{ flex: 1, backgroundColor: 'rgba(5,8,20,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          style={{ backgroundColor: t.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xl, paddingBottom: space.xxxl }}>
          <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: t.border, marginBottom: space.lg }} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Pill label={`Stagione ${season.n}`} color={t.textDim} bg={t.surfaceAlt} />
            <Pill label={`+${xp} XP`} color={t.accent} bg={t.surfaceAlt} icon={<Icon name="star" size={12} color={t.accent} />} />
            <Pill label={done ? 'già riscattati' : `+${coins}`} color={t.text} bg={t.surfaceAlt} icon={<CoinGlyph size={14} />} />
          </View>
          <Txt variant="h2" style={{ marginTop: space.md }}>
            {lesson.title}
          </Txt>
          <Txt style={{ marginTop: space.sm, color: t.textDim }}>{lesson.summary}</Txt>
          <Txt variant="bodyBold" style={{ marginTop: space.xl }}>
            {lesson.question}
          </Txt>
          <Animated.View style={[{ gap: 10, marginTop: space.md }, shakeSt]}>
            {lesson.answers.map((a, i) => {
              const isPicked = picked === i;
              const color = isPicked ? (right ? t.up : t.down) : t.border;
              return (
                <Bouncy key={i} onPress={() => choose(i)} scaleTo={0.97}>
                  <View
                    style={{
                      padding: space.lg,
                      borderRadius: radius.md,
                      borderWidth: 2,
                      borderColor: color,
                      backgroundColor: isPicked ? (right ? t.upSoft : t.downSoft) : t.surfaceAlt,
                    }}>
                    <Txt variant="bodyBold">{a}</Txt>
                  </View>
                </Bouncy>
              );
            })}
          </Animated.View>
          {right && (
            <Animated.View entering={FadeInDown.springify()} style={{ marginTop: space.xl }}>
              <GemButton title={done ? 'Ripasso completato' : `Fatto! +${coins} SONAR COIN`} variant="gem" onPress={onClose} />
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function SeasonCard({
  season,
  selected,
  done,
  total,
  lock,
  onPress,
}: {
  season: Season;
  selected: boolean;
  done: number;
  total: number;
  lock: 'plan' | 'progress' | null;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Bouncy onPress={onPress} scaleTo={0.95}>
      <View
        style={{
          width: 168,
          borderRadius: radius.lg,
          padding: space.lg,
          overflow: 'hidden',
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? t.accent : t.border,
          backgroundColor: t.surface,
          opacity: lock ? 0.7 : 1,
        }}>
        <LinearGradient colors={season.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt variant="label">Stagione {season.n}</Txt>
          {lock && <Icon name="lock" size={14} color={t.textFaint} />}
        </View>
        <Txt variant="h3" style={{ marginTop: 4 }}>
          {season.name}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <CoinGlyph size={14} />
          <Txt variant="small">{coinsForSeason(season.n)} SC / lezione</Txt>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: 10, overflow: 'hidden' }}>
          <View style={{ width: `${(done / total) * 100}%`, height: '100%', backgroundColor: t.accent }} />
        </View>
        <Txt variant="small" style={{ fontSize: 11, marginTop: 6 }}>
          {lock === 'plan' ? `Piano ${season.plan.toUpperCase()}` : lock === 'progress' ? `Finisci la stagione ${season.n - 1}` : `${done}/${total} lezioni`}
        </Txt>
      </View>
    </Bouncy>
  );
}

export default function Impara() {
  const t = useTheme();
  const { xp, completedLessons, plan } = useApp();
  const [open, setOpen] = useState<Lesson | null>(null);
  const { level, progress, toNext } = levelFromXp(xp);
  const rank = plan ? PLAN_RANK[plan] : 0;

  const seasonInfo = SEASONS.map((s, i) => {
    const lessons = s.chapters.flatMap((c) => c.lessons);
    const done = lessons.filter((l) => completedLessons.includes(l.id)).length;
    const prevDone = i === 0 || SEASONS[i - 1].chapters.flatMap((c) => c.lessons).every((l) => completedLessons.includes(l.id));
    const lock: 'plan' | 'progress' | null = PLAN_RANK[s.plan] > rank ? 'plan' : !prevDone ? 'progress' : null;
    return { s, lessons, done, lock };
  });
  const firstOpenSeason = Math.max(0, seasonInfo.findIndex((x) => !x.lock && x.done < x.lessons.length));
  const [sel, setSel] = useState(firstOpenSeason);
  const cur = seasonInfo[sel];
  const firstOpenLesson = cur.lessons.find((l) => !completedLessons.includes(l.id))?.id;

  let nodeIndex = 0;
  return (
    <Screen title="Impara" subtitle="Percorso trader">
      <HeroCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: t.heroGem[2] + '66' }}>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 26, color: t.heroText }}>{level}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.4, color: t.heroDim }}>LIVELLO</Text>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: t.heroText }}>{level < 3 ? 'Esploratore' : level < 6 ? 'Navigatore' : 'Capitano'}</Text>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 8, overflow: 'hidden' }}>
              <LinearGradient colors={t.heroGem} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(6, progress * 100)}%`, height: '100%', borderRadius: 5 }} />
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: t.heroDim, marginTop: 6 }}>
              {xp} XP · {toNext} al prossimo livello
            </Text>
          </View>
        </View>
      </HeroCard>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.lg, marginTop: space.xl }} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}>
        {seasonInfo.map((x, i) => (
          <SeasonCard
            key={x.s.n}
            season={x.s}
            selected={i === sel}
            done={x.done}
            total={x.lessons.length}
            lock={x.lock}
            onPress={() => (x.lock === 'plan' ? router.push('/plans') : setSel(i))}
          />
        ))}
      </ScrollView>

      <Txt variant="small" style={{ marginTop: space.md }}>
        {cur.s.tagline}
      </Txt>

      {cur.s.chapters.map((ch, ci) => (
        <View key={ch.id} style={{ marginTop: space.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: space.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
            <Pill label={`Capitolo ${ci + 1} · ${ch.title}`} color={t.text} bg={t.surface} />
            <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
          </View>
          <View style={{ gap: space.xl }}>
            {ch.lessons.map((l) => {
              const i = nodeIndex++;
              const state: NodeState = cur.lock
                ? 'locked'
                : completedLessons.includes(l.id)
                  ? 'done'
                  : l.id === firstOpenLesson
                    ? 'current'
                    : 'open';
              return (
                <Node
                  key={`${cur.s.n}-${l.id}`}
                  lesson={l}
                  index={i}
                  state={state}
                  offset={Math.sin(i * 1.1) * 80}
                  onPress={() => (cur.lock ? null : setOpen(l))}
                />
              );
            })}
          </View>
        </View>
      ))}

      {open && <LessonSheet lesson={open} season={cur.s} onClose={() => setOpen(null)} />}
    </Screen>
  );
}
