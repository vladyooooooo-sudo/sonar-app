import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { LESSONS, levelFromXp, type Lesson } from '@/data/lessons';
import type { PlanId } from '@/data/plans';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { font, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const TIER_RANK: Record<PlanId, number> = { base: 0, medio: 1, pro: 2 };

function Node({
  lesson,
  state,
  offset,
  onPress,
  index,
}: {
  lesson: Lesson;
  state: 'done' | 'current' | 'open' | 'locked';
  offset: number;
  onPress: () => void;
  index: number;
}) {
  const t = useTheme();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (state === 'current') bob.value = withRepeat(withSequence(withTiming(-6, { duration: 700 }), withTiming(0, { duration: 700 })), -1);
  }, [state, bob]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const active = state === 'current' || state === 'open';
  const size = state === 'current' ? 84 : 72;
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()} style={{ alignItems: 'center', transform: [{ translateX: offset }] }}>
      <Animated.View style={st}>
        <Bouncy onPress={onPress} scaleTo={0.88}>
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
            <View
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: size / 2, borderBottomWidth: 6, borderColor: 'rgba(0,0,0,0.18)' },
              ]}
            />
            <Icon
              name={state === 'done' ? 'check' : state === 'locked' ? 'lock' : lesson.icon}
              size={state === 'current' ? 34 : 28}
              color={state === 'locked' ? t.textFaint : state === 'done' ? '#0B1230' : t.dark ? '#140F04' : '#fff'}
              stroke={2.4}
            />
          </View>
        </Bouncy>
      </Animated.View>
      <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: state === 'locked' ? t.textFaint : t.text, marginTop: 8 }}>
        {lesson.title}
      </Text>
      {lesson.tier !== 'base' && state === 'locked' && (
        <Text style={{ fontFamily: font.bodyBold, fontSize: 10, letterSpacing: 1, color: t.accent, marginTop: 2 }}>
          {lesson.tier.toUpperCase()}
        </Text>
      )}
    </Animated.View>
  );
}

function LessonSheet({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const t = useTheme();
  const { dispatch, completedLessons } = useApp();
  const [picked, setPicked] = useState<number | null>(null);
  const done = completedLessons.includes(lesson.id);
  const right = picked === lesson.correct;
  const shake = useSharedValue(0);
  const shakeSt = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const choose = (i: number) => {
    if (picked !== null && picked === lesson.correct) return;
    setPicked(i);
    if (i === lesson.correct) {
      haptic.success();
      dispatch({ type: 'completeLesson', id: lesson.id, xp: lesson.xp, coins: lesson.coins });
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
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pill label={`+${lesson.xp} XP`} color={t.accent} bg={t.surfaceAlt} icon={<Icon name="star" size={12} color={t.accent} />} />
            <Pill label={`+${lesson.coins}`} color={t.text} bg={t.surfaceAlt} icon={<CoinGlyph size={14} />} />
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
          {(right || done) && (
            <Animated.View entering={FadeInDown.springify()} style={{ marginTop: space.xl }}>
              <GemButton title={right ? `Fatto! +${lesson.coins} SONAR COIN` : 'Lezione completata'} variant="gem" onPress={onClose} />
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function Impara() {
  const t = useTheme();
  const { xp, completedLessons, plan } = useApp();
  const [open, setOpen] = useState<Lesson | null>(null);
  const { level, progress, toNext } = levelFromXp(xp);
  const rank = plan ? TIER_RANK[plan] : 0;
  const firstOpen = LESSONS.findIndex((l) => !completedLessons.includes(l.id) && TIER_RANK[l.tier] <= rank);

  return (
    <Screen title="Impara" subtitle="Percorso trader">
      <HeroCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: t.heroGem[2] + '66' }}>
            <Text style={{ fontFamily: font.displayHeavy, fontSize: 26, color: t.heroText }}>{level}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 11, letterSpacing: 1.4, color: t.heroDim }}>LIVELLO</Text>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: t.heroText }}>
              {level < 3 ? 'Esploratore' : level < 6 ? 'Navigatore' : 'Capitano'}
            </Text>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 8, overflow: 'hidden' }}>
              <LinearGradient colors={t.heroGem} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(6, progress * 100)}%`, height: '100%', borderRadius: 5 }} />
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: t.heroDim, marginTop: 6 }}>
              {xp} XP · {toNext} al prossimo livello
            </Text>
          </View>
        </View>
      </HeroCard>

      <View style={{ marginTop: space.xxl, gap: space.xl }}>
        {LESSONS.map((l, i) => {
          const locked = TIER_RANK[l.tier] > rank;
          const state = completedLessons.includes(l.id) ? 'done' : locked ? 'locked' : i === firstOpen ? 'current' : 'open';
          return (
            <Node
              key={l.id}
              lesson={l}
              index={i}
              state={state}
              offset={Math.sin(i * 1.1) * 80}
              onPress={() => (locked ? router.push('/plans') : setOpen(l))}
            />
          );
        })}
      </View>

      {open && <LessonSheet lesson={open} onClose={() => setOpen(null)} />}
    </Screen>
  );
}
