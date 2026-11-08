import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme';
import { tap } from './haptics';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** makes the card pressable: sinks (inset shadow + scale .975) with spring and haptic */
  onPress?: () => void;
  /** press feedback without onPress (prototype: every card sinks). default true when onPress given */
  pressable?: boolean;
  radius?: number;
  padding?: number;
  small?: boolean;
};

const SPRING = { damping: 14, stiffness: 220, mass: 0.7 };

export function NeuCard({ children, style, onPress, pressable, radius = 28, padding = 18, small }: Props) {
  const { colors, shadows } = useTheme();
  const down = useSharedValue(0);
  const interactive = pressable ?? !!onPress;
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: 1 - down.value * 0.025 }] }));
  const base: ViewStyle = { backgroundColor: colors.bg, borderRadius: radius, padding };
  // The shadow swap is instantaneous (shadows can't interpolate); scale is sprung.
  const [pressedState, setPressed] = useState(false);
  const shadow = pressedState ? shadows.inset : small ? shadows.raisedS : shadows.raised;
  const inner = (
    <Animated.View style={[base, { boxShadow: shadow }, anim, style]}>{children}</Animated.View>
  );
  if (!interactive) return inner;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { setPressed(true); down.value = withSpring(1, SPRING); tap(); }}
      onPressOut={() => { setPressed(false); down.value = withSpring(0, SPRING); }}
    >
      {inner}
    </Pressable>
  );
}



