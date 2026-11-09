import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fontFamily, useTheme } from '../theme';
import { success } from './haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK = 'M14 33 L27 46 L50 20';
const CHECK_LEN = 64;
const OUT = Easing.out(Easing.cubic);

type Props = {
  visible: boolean;
  /** called ~900ms after show (when the soft fade-out starts) */
  onDone?: () => void;
  caption?: string;
  /** corner radius of the host surface, so the overlay is clipped to it */
  radius?: number;
};

/** Soft green circle expands from the bottom center, white check draws in, caption fades in, then fades out. */
export function SuccessOverlay({ visible, onDone, caption = 'Добавлено', radius = 0 }: Props) {
  const { colors } = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const grow = useSharedValue(0);
  const draw = useSharedValue(0);
  const cap = useSharedValue(0);
  const fade = useSharedValue(1);
  const done = useRef(onDone);
  done.current = onDone;
  const fire = () => done.current?.();

  useEffect(() => {
    if (!visible) { grow.value = 0; draw.value = 0; cap.value = 0; fade.value = 1; return; }
    success();
    grow.value = withTiming(1, { duration: 380, easing: OUT });
    draw.value = withDelay(250, withTiming(1, { duration: 320, easing: OUT }));
    cap.value = withDelay(500, withTiming(1, { duration: 250, easing: OUT }));
    fade.value = withDelay(900, withTiming(0, { duration: 300, easing: Easing.inOut(Easing.cubic) }));
    const t = setTimeout(fire, 900);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const D = 2 * Math.hypot(size.w, size.h);
  const circle = useAnimatedStyle(() => ({ transform: [{ scale: 0.02 + 0.98 * grow.value }] }));
  const root = useAnimatedStyle(() => ({ opacity: fade.value }));
  const path = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - draw.value) }));
  const capSt = useAnimatedStyle(() => ({ opacity: cap.value, transform: [{ translateY: (1 - cap.value) * 8 }] }));
  if (!visible) return null;
  return (
    <Animated.View
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, root]}
    >
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', width: D, height: D, borderRadius: D / 2, left: size.w / 2 - D / 2, top: size.h * 0.85 - D / 2, backgroundColor: colors.ok }, circle]}
      />
      <View style={{ alignItems: 'center' }}>
        <Svg width={64} height={64} viewBox="0 0 64 64">
          <AnimatedPath d={CHECK} stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none"
            strokeDasharray={CHECK_LEN} animatedProps={path} />
        </Svg>
        <Animated.View style={capSt}>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 18, color: '#fff', marginTop: 8 }}>{caption}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
