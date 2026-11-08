import { Text, View } from 'react-native';
import { AnimatedNumber, Chip, Icon, NeuButton, NeuCard } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import type { Goal } from '../../store/types';
import { Confetti } from './Confetti';
import { Jar } from './Jar';
import { etaText } from './pace';

type Props = { goal: Goal; perMonth: number; now: Date; burst: number; onDeposit: () => void };

export function GoalCard({ goal, perMonth, now, burst, onDeposit }: Props) {
  const { colors, shadows } = useTheme();
  const ratio = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0;
  const pct = Math.floor(ratio * 100);
  const done = ratio >= 1;
  return (
    <NeuCard>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <View style={{ width: 92 }}><Jar progress={ratio} /></View>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.inset }}>
              <Text style={{ fontSize: 17 }}>{goal.emoji ?? '🎯'}</Text>
            </View>
            <Text numberOfLines={2} style={{ flex: 1, fontFamily: fontFamily.extrabold, fontSize: 15, lineHeight: 19, color: colors.navy }}>{goal.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <AnimatedNumber value={goal.saved} suffix=" ₽" style={{ fontSize: 22, letterSpacing: -0.5 }} />
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }}>{'  из '}</Text>
            <AnimatedNumber value={goal.target} suffix=" ₽" style={{ fontSize: 13, fontFamily: fontFamily.semibold, color: colors.text2 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={`${pct}%`}
              icon={<Icon name={done ? 'check' : 'target'} size={15} color={done ? colors.ok : colors.accent} />}
            />
          </View>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: done ? colors.ok : colors.text2 }}>
            {done ? etaText(0, perMonth, now) : `${etaText(goal.target - goal.saved, perMonth, now)} при текущем темпе`}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <NeuButton title={done ? 'Цель выполнена' : 'Пополнить'} onPress={onDeposit} disabled={done} full />
      </View>
      <Confetti trigger={burst} />
    </NeuCard>
  );
}
