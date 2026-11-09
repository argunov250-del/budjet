import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { Icon, NeuCard, success, tap } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import type { FillInfo } from './helpers';
import { plural } from './helpers';

function Pill({ title, onPress, disabled }: { title: string; onPress?: () => void; disabled?: boolean }) {
  const { colors, shadows } = useTheme();
  const k = useSharedValue(0);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 - k.value * 0.07 }] }));
  return (
    <Pressable disabled={disabled} onPress={onPress} style={{ alignSelf: 'flex-start' }}
      onPressIn={() => { k.value = withSpring(1, { damping: 20, stiffness: 140 }); tap(); }}
      onPressOut={() => { k.value = withSpring(0, { damping: 20, stiffness: 140 }); }}>
      <Animated.View style={[{ backgroundColor: colors.ink, borderRadius: 99, paddingVertical: 10, paddingHorizontal: 20, boxShadow: shadows.pill, opacity: disabled ? 0.55 : 1 }, a]}>
        <Text style={{ color: colors.inkText, fontFamily: fontFamily.bold, fontSize: 13.5 }}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function FillHint({ info, filled, onFill }: { info: FillInfo | null; filled: number; onFill: () => void }) {
  const { colors, shadows } = useTheme();
  const done = filled > 0;
  const [last, setLast] = useState(info);
  useEffect(() => { if (info) setLast(info); }, [info]);
  const bounce = useSharedValue(1);
  useEffect(() => {
    if (done) bounce.value = withSequence(withSpring(1.03, { damping: 6, stiffness: 140 }), withSpring(1, { damping: 20, stiffness: 140 }));
  }, [done, bounce]);
  const ib = useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));
  const data = info ?? last;
  if (!data && !done) return null;
  const n = data?.missing.length ?? 0;
  return (
    <NeuCard pressable={false}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.inset }}>
          <Animated.View style={ib}>
            {done ? <Icon name="check" size={24} color={colors.ok} strokeWidth={2.6} /> : <Icon name="calendar" size={24} color={colors.accent} />}
          </Animated.View>
        </View>
        {done ? (
          <Animated.View key="done" entering={FadeIn.duration(450)} style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
              <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 15, color: colors.navy }}>Готово ✓</Text>
              <View style={{ marginLeft: 6, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 99, backgroundColor: 'rgba(31,169,113,0.15)' }}>
                <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 12, color: colors.ok }}>
                  +{filled} {plural(filled, 'операция', 'операции', 'операций')}
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: fontFamily.medium, fontSize: 12.5, lineHeight: 17.5, color: colors.text2, marginBottom: 12 }}>Вчера заполнено. Серия продолжается</Text>
            <Pill title="Записано" disabled />
          </Animated.View>
        ) : (
          <Animated.View key="idle" entering={FadeIn.duration(300)} style={{ flex: 1 }}>
            <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 15, lineHeight: 19, color: colors.navy, marginBottom: 4 }}>
              {data!.total > data!.missing.length
                ? `${cap(data!.yesterdayLabel)} записано ${data!.recorded} из ${data!.total} трат`
                : `${cap(data!.yesterdayLabel)} не записано ${n} ${plural(n, 'трата', 'траты', 'трат')}`}
            </Text>
            <Text style={{ fontFamily: fontFamily.medium, fontSize: 12.5, lineHeight: 17.5, color: colors.text2, marginBottom: 12 }}>
              Добавь их из недавних одним касанием. Серия не прервётся
            </Text>
            <Pill title="Заполнить" onPress={() => { success(); onFill(); }} />
          </Animated.View>
        )}
      </View>
    </NeuCard>
  );
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
