import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '../../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BODY = 'M30 8 H70 V20 C70 24 88 28 88 46 V112 A14 14 0 0 1 74 126 H26 A14 14 0 0 1 12 112 V46 C12 28 30 24 30 20 Z';
const TOP = 30;
const BOTTOM = 124;

function wave(level: number, phase: number, amp: number, freq: number) {
  'worklet';
  const y = BOTTOM - level * (BOTTOM - TOP);
  let d = `M0 ${y.toFixed(2)}`;
  for (let x = 0; x <= 100; x += 4) {
    const yy = y + (level > 0.001 ? amp * Math.sin((x / 100) * Math.PI * 2 * freq + phase) : 0);
    d += ` L${x} ${yy.toFixed(2)}`;
  }
  return `${d} L100 140 L0 140 Z`;
}

/** Glass jar with liquid that fills to `progress` (0..1), with two moving waves. */
export function Jar({ progress, width = 92 }: { progress: number; width?: number }) {
  const { colors } = useTheme();
  const level = useSharedValue(0);
  const phase = useSharedValue(0);
  useEffect(() => {
    level.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 2600, easing: Easing.linear }), -1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const back = useAnimatedProps(() => ({ d: wave(level.value, -phase.value * 1 + 1.5, 2.6, 1.2) }));
  const front = useAnimatedProps(() => ({ d: wave(level.value, phase.value, 2.2, 1.5) }));
  const full = progress >= 1;
  const c1 = full ? colors.ok : colors.accent2;
  const c2 = full ? colors.ok : colors.accent;
  return (
    <Svg width={width} height={(width * 130) / 100} viewBox="0 0 100 130">
      <Defs>
        <LinearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c1} />
          <Stop offset="1" stopColor={c2} />
        </LinearGradient>
        <ClipPath id="jarClip"><Path d={BODY} /></ClipPath>
      </Defs>
      <Path d={BODY} fill={colors.track} />
      <Path d="M18 48 V108" stroke={colors.shLight} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      <AnimatedPath animatedProps={back} fill="url(#liq)" opacity={0.45} clipPath="url(#jarClip)" />
      <AnimatedPath animatedProps={front} fill="url(#liq)" clipPath="url(#jarClip)" />
      <Path d={BODY} fill="none" stroke={colors.text2} strokeWidth={2.4} strokeOpacity={0.55} strokeLinejoin="round" />
      <Path d="M27 8 H73" stroke={colors.text2} strokeWidth={4} strokeLinecap="round" strokeOpacity={0.7} />
    </Svg>
  );
}
