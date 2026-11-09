import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

export const EMERGE_MS = 800;
export const EMERGE_STAGGER = 70;
const EASE = Easing.out(Easing.cubic);

type Props = {
  children: ReactNode;
  /** stagger index; delay = index * 70ms */
  index?: number;
  /** override delay in ms */
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** "Emerging from under water": opacity 0->1, scale .94->1, translateY 6->0. No spring, no overshoot. */
export function FadeInUp({ children, index = 0, delay, style }: Props) {
  const p = useSharedValue(0);
  const d = delay ?? index * EMERGE_STAGGER;
  useEffect(() => {
    p.value = withDelay(d, withTiming(1, { duration: EMERGE_MS, easing: EASE }));
  }, [d, p]);
  const a = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 6 }, { scale: 0.94 + 0.06 * p.value }],
  }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}

/** Same effect as a Reanimated `entering` prop (for conditionally mounted / list items). */
export function emergeEntering(index = 0) {
  return (() => {
    'worklet';
    const cfg = { duration: EMERGE_MS, easing: Easing.out(Easing.cubic) };
    const delay = index * EMERGE_STAGGER;
    return {
      initialValues: { opacity: 0, transform: [{ translateY: 6 }, { scale: 0.94 }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, cfg)),
        transform: [
          { translateY: withDelay(delay, withTiming(0, cfg)) },
          { scale: withDelay(delay, withTiming(1, cfg)) },
        ],
      },
    };
  }) as never;
}
