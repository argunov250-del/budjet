import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

type Props = {
  /** 0..1 */
  value: number;
  /** orange "hot" gradient (prototype: >= 85%); default auto at value >= .85 */
  hot?: boolean;
  height?: number;
  /** delay of the initial fill, ms */
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ value, hot, height = 8, delay = 0, style }: Props) {
  const { colors, shadows } = useTheme();
  const v = Math.max(0, Math.min(1, value));
  const isHot = hot ?? v >= 0.85;
  const p = useSharedValue(0);
  const first = useSharedValue(true);
  useEffect(() => {
    if (first.value) {
      first.value = false;
      p.value = withTiming(v, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      if (delay) p.value = 0; // overwritten below by delayed timeout
    } else {
      p.value = withSpring(v, { damping: 20, stiffness: 100 });
    }
    if (delay) {
      const t = setTimeout(() => { p.value = withTiming(v, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) }); }, delay);
      return () => clearTimeout(t);
    }
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  const stops = isHot ? ([colors.accent2, colors.accent] as const) : ([colors.barFrom, colors.barTo] as const);
  return (
    <View style={[{ height, borderRadius: 99, backgroundColor: colors.track, boxShadow: shadows.insetS, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height: '100%', borderRadius: 99, overflow: 'hidden' }, fill]}>
        <LinearGradient colors={stops} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}
