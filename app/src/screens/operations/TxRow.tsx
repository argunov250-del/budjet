import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown, LinearTransition, SlideOutLeft, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { Icon, formatRub, tap } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import type { Category, Transaction } from '../../store';

const THRESH = -96;

export function TxRow({ tx, category, onDelete, index }: { tx: Transaction; category?: Category; onDelete: () => void; index: number }) {
  const { colors, shadows } = useTheme();
  const x = useSharedValue(0);
  const fire = () => { tap(); onDelete(); };
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onUpdate((e) => { x.value = Math.min(0, e.translationX); })
    .onEnd((e) => {
      if (e.translationX < THRESH) {
        x.value = withTiming(-420, { duration: 180 }, (d) => { if (d) runOnJS(fire)(); });
      } else x.value = withSpring(0, { damping: 16, stiffness: 200 });
    });
  const row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const bin = useAnimatedStyle(() => ({ opacity: Math.min(1, -x.value / 60) }));
  const time = new Date(tx.date);
  const hm = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(16)}
      exiting={SlideOutLeft.duration(220)}
      layout={LinearTransition.springify().damping(18)}
      style={{ justifyContent: 'center' }}
    >
      <Animated.View style={[{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingRight: 22 }, bin]}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.accent }}>Удалить</Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, backgroundColor: colors.bg }, row]}>
          <View style={{ width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: shadows.inset }}>
            <Icon name={category?.icon ?? 'tag'} size={20} color={category?.color ?? colors.text2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.navy }}>{tx.note || category?.name}</Text>
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{category?.name} · {hm}</Text>
          </View>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14.5, color: colors.navy, fontVariant: ['tabular-nums'] }}>−{formatRub(tx.amount).replace('−', '')}</Text>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
