import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  /** stagger index; delay = index * 90ms (prototype --d) */
  index?: number;
  /** override delay in ms */
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeInUp({ children, index = 0, delay, distance = 22, style }: Props) {
  const p = useSharedValue(0);
  const d = delay ?? index * 90;
  useEffect(() => {
    p.value = withDelay(d, withSpring(1, { damping: 14, stiffness: 90, mass: 0.9 }));
  }, [d, p]);
  const a = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.6), transform: [{ translateY: (1 - p.value) * distance }] }));
  return <Animated.View style={[a, style]}>{children}</Animated.View>;
}
