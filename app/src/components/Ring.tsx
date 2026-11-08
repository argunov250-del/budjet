import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { gradients, useTheme } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 70;
const C = 2 * Math.PI * R;

type Props = {
  /** 0..1 portion of the ring that is filled (e.g. left / limit) */
  progress: number;
  size?: number;
  duration?: number;
  /** content centered inside the ring */
  children?: ReactNode;
};

/** Prototype ring: 180-unit viewBox, r=70, stroke 16, gradient arc with round cap, glowing knob at the arc end. */
export function Ring({ progress, size = 158, duration = 1600, children }: Props) {
  const { colors } = useTheme();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), { duration, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, [progress, duration, p]);

  const arcProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.value) }));
  const knobPos = (v: number) => {
    'worklet';
    const a = v * 2 * Math.PI;
    return { cx: 90 + R * Math.sin(a), cy: 90 - R * Math.cos(a) };
  };
  const glowProps = useAnimatedProps(() => knobPos(p.value));
  const dotProps = useAnimatedProps(() => knobPos(p.value));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 180 180" style={{ overflow: 'visible' }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradients.ring[0]} />
            <Stop offset="1" stopColor={gradients.ring[1]} />
          </LinearGradient>
        </Defs>
        {/* soft track: dark offset ring + light offset ring emulate the prototype's drop-shadow */}
        <Circle cx={92} cy={92} r={R} stroke={colors.shDark} strokeWidth={16} fill="none" opacity={0.55} />
        <Circle cx={88} cy={88} r={R} stroke={colors.shLight} strokeWidth={16} fill="none" />
        <Circle cx={90} cy={90} r={R} stroke={colors.track} strokeWidth={16} fill="none" />
        <AnimatedCircle
          cx={90} cy={90} r={R}
          stroke="url(#ringGrad)" strokeWidth={16} strokeLinecap="round" fill="none"
          strokeDasharray={`${C} ${C}`}
          rotation={-90} originX={90} originY={90}
          animatedProps={arcProps}
        />
        <AnimatedCircle r={11} fill={colors.accentGlow} opacity={0.35} animatedProps={glowProps} />
        <AnimatedCircle r={6.5} fill={colors.bg} animatedProps={glowProps} />
        <AnimatedCircle r={3} fill={colors.accent} animatedProps={dotProps} />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
