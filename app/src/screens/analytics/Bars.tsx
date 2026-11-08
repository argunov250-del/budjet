import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily, useTheme } from '../../theme';

export type BarItem = { label: string; value: number; hot?: boolean };
const H = 120;

function Bar({ item, max, index }: { item: BarItem; max: number; index: number }) {
  const { colors, shadows } = useTheme();
  const h = useSharedValue(0);
  const target = max > 0 ? Math.max(item.value > 0 ? 6 : 0, (item.value / max) * H) : 0;
  useEffect(() => {
    h.value = withDelay(index * 70, withTiming(target, { duration: 900, easing: Easing.out(Easing.back(1.3)) }));
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ height: h.value }));
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      <View style={{ height: H, width: '100%', maxWidth: 30, justifyContent: 'flex-end', borderRadius: 10, backgroundColor: colors.track, boxShadow: shadows.insetS, overflow: 'hidden' }}>
        <Animated.View style={[{ width: '100%', borderRadius: 10 }, st]}>
          <LinearGradient
            colors={item.hot ? [colors.accent2, colors.accent] : [colors.barFrom, colors.barTo]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1, borderRadius: 10 }}
          />
        </Animated.View>
      </View>
      <Text style={{ fontFamily: fontFamily.bold, fontSize: 11, color: item.hot ? colors.accent : colors.text2 }}>{item.label}</Text>
    </View>
  );
}

export function Bars({ items }: { items: BarItem[] }) {
  const max = Math.max(0, ...items.map((i) => i.value));
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
      {items.map((it, i) => <Bar key={it.label} item={it} max={max} index={i} />)}
    </View>
  );
}
