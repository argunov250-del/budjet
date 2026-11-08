import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const COLORS = ['#FF6A2B', '#FFA05C', '#6C93E8', '#1FA971', '#FFC107', '#E8456B', '#8B6CE8'];
const N = 34;

type P = { vx: number; vy: number; rot: number; size: number; color: string; round: boolean; dur: number };

function Particle({ p, trigger }: { p: P; trigger: number }) {
  const t = useSharedValue(1);
  useEffect(() => {
    if (!trigger) return;
    t.value = 0;
    t.value = withTiming(1, { duration: p.dur, easing: Easing.out(Easing.quad) });
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
  const style = useAnimatedStyle(() => ({
    opacity: t.value >= 1 ? 0 : 1 - t.value * t.value * t.value,
    transform: [
      { translateX: p.vx * t.value },
      { translateY: p.vy * t.value + 420 * t.value * t.value },
      { rotate: `${p.rot * t.value}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: p.size, height: p.round ? p.size : p.size * 0.5, borderRadius: p.round ? p.size : 1, backgroundColor: p.color },
        style,
      ]}
    />
  );
}

/** Simple confetti burst from the centre of its container; re-fires when `trigger` changes (non-zero). */
export function Confetti({ trigger }: { trigger: number }) {
  const parts = useMemo<P[]>(
    () =>
      Array.from({ length: N }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const v = 90 + Math.random() * 150;
        return {
          vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120,
          rot: (Math.random() - 0.5) * 900, size: 6 + Math.random() * 6,
          color: COLORS[i % COLORS.length], round: Math.random() > 0.6, dur: 1100 + Math.random() * 700,
        };
      }),
    [trigger], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '45%', width: 0, height: 0, zIndex: 10 }}>
      {parts.map((p, i) => <Particle key={i} p={p} trigger={trigger} />)}
    </View>
  );
}
