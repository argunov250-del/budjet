import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeOut, LinearTransition, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Icon, NeuCard, tap } from '../../components';
import type { Account, Category, Transaction } from '../../store/types';
import { describeTx } from '../shared/txInfo';
import { fontFamily, useTheme } from '../../theme';
import { opDateLabel } from './helpers';

const THRESH = 96;

function OpRow({ tx, cats, accounts, first, now, animateIn, onDelete }: { tx: Transaction; cats: Category[]; accounts: Account[]; first: boolean; now: Date; animateIn: boolean; onDelete: (id: string) => void }) {
  const { colors, shadows } = useTheme();
  const x = useSharedValue(0);
  const armed = useSharedValue(false);
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      x.value = Math.min(0, e.translationX);
      const a = x.value < -THRESH;
      if (a !== armed.value) { armed.value = a; if (a) runOnJS(tap)(); }
    })
    .onEnd((e) => {
      if (x.value < -THRESH || e.velocityX < -1100) {
        x.value = withTiming(-520, { duration: 220 }, (fin) => { if (fin) runOnJS(onDelete)(tx.id); });
      } else {
        armed.value = false;
        x.value = withSpring(0, { damping: 14, stiffness: 220, mass: 0.8 });
      }
    });
  const fg = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const bg = useAnimatedStyle(() => ({ opacity: Math.min(1, -x.value / 50), transform: [{ scale: armed.value ? withSpring(1.15) : withSpring(1) }] }));
  const v = describeTx(tx, cats, accounts);
  const icon = v.icon;
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(160)}
      entering={animateIn ? FadeInDown.springify().damping(14) : undefined}
      exiting={FadeOut.duration(180)}
    >
      <View style={{ borderTopWidth: first ? 0 : 1, borderTopColor: colors.divider }}>
        <View style={{ justifyContent: 'center' }}>
          <Animated.View style={[{ position: 'absolute', right: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }, bg]}>
            <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.accent }}>Удалить</Text>
          </Animated.View>
          <GestureDetector gesture={pan}>
            <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, backgroundColor: colors.bg }, fg]}>
              <View style={{ width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.raisedS }}>
                <Icon name={icon} size={20} color={colors.navy} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.navy }}>{v.title}</Text>
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{v.sub}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14.5, color: v.isIncome ? colors.ok : colors.navy, fontVariant: ['tabular-nums'] }}>{`${v.sign}${v.amount}`}</Text>
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{opDateLabel(tx.date, now)}</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </Animated.View>
  );
}

export function RecentOps({ txs, categories, accounts, now, onDelete }: { txs: Transaction[]; categories: Category[]; accounts: Account[]; now: Date; onDelete: (id: string) => void }) {
  const { colors } = useTheme();
  const mounted = useRef(false);
  const animateIn = mounted.current;
  useEffect(() => {
    const id = setTimeout(() => { mounted.current = true; }, 1500);
    return () => clearTimeout(id);
  }, []);
  return (
    <NeuCard pressable padding={0} style={{ paddingVertical: 8, paddingHorizontal: 16, overflow: 'hidden' }}>
      {txs.length === 0 && (
        <Text style={{ paddingVertical: 18, textAlign: 'center', fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }}>Пока нет операций. Добавьте первую на вкладке «Операции»</Text>
      )}
      {txs.map((t, i) => (
        <OpRow key={t.id} tx={t} cats={categories} accounts={accounts} first={i === 0} now={now} animateIn={animateIn} onDelete={onDelete} />
      ))}
    </NeuCard>
  );
}
