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
  const sink = useAnimatedStyle(() => ({ opacity: down.value > 1 ? 1 : down.value < 0 ? 0 : down.value }));
  const base: ViewStyle = { backgroundColor: colors.bg, borderRadius: radius, padding };
  const shadow = small ? shadows.raisedS : shadows.raised;
  // Raised shadow stays; a separate inset overlay (clipped to the radius) fades in on press.
  const inner = (
    <Animated.View style={[base, { boxShadow: shadow }, anim, style]}>
      {children}
      {interactive ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius, overflow: 'hidden', boxShadow: shadows.inset }, sink]} />
      ) : null}
    </Animated.View>
  );
  if (!interactive) return inner;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { down.value = withSpring(1, SPRING); tap(); }}
      onPressOut={() => { down.value = withSpring(0, SPRING); }}
    >
      {inner}
    </Pressable>
  );
}



