import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AnimatedNumber } from '../../components';
import { fontFamily, useTheme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export type Slice = { id: string; label: string; value: number; color: string };

const SIZE = 180;
const R = 66;
const SW = 22;
const C = 2 * Math.PI * R;
const GAP = 3;

function Seg({ s, start, total, grow, sel, selected, dim }: { s: Slice; start: number; total: number; grow: { value: number }; sel: { value: number }; selected: boolean; dim: boolean }) {
  const len = (s.value / total) * C;
  const from = (start / total) * C;
  const props = useAnimatedProps(() => {
    const visible = Math.max(0, Math.min(len, grow.value * C - from));
    const dash = Math.max(0, visible - (visible >= len ? GAP : 0));
    return {
      strokeDasharray: [dash, C],
      strokeWidth: SW + 8 * sel.value * (selected ? 1 : 0),
    };
  });
  return (
    <AnimatedCircle
      cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={s.color} strokeLinecap="butt"
      strokeDashoffset={-from} opacity={dim ? 0.35 : 1} animatedProps={props}
      rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}
    />
  );
}

export function Donut({ slices, selectedId, total }: { slices: Slice[]; selectedId: string | null; total: number }) {
  const { colors, shadows } = useTheme();
  const grow = useSharedValue(0);
  const sel = useSharedValue(0);
  useEffect(() => { grow.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { sel.value = withTiming(selectedId ? 1 : 0, { duration: 300 }); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  const sum = slices.reduce((a, s) => a + s.value, 0);
  let acc = 0;
  const cur = slices.find((s) => s.id === selectedId);
  return (
    <View style={{ width: SIZE, height: SIZE, alignSelf: 'center' }}>
      <View style={{ position: 'absolute', left: 25, top: 25, right: 25, bottom: 25, borderRadius: 99, boxShadow: shadows.inset }} />
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={colors.track} strokeWidth={SW} opacity={sum ? 0 : 1} />
        {slices.map((s) => {
          const start = acc; acc += s.value;
          return <Seg key={s.id} s={s} start={start} total={sum || 1} grow={grow} sel={sel} selected={s.id === selectedId} dim={!!selectedId && s.id !== selectedId} />;
        })}
      </Svg>
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{cur ? cur.label : 'Всего'}</Text>
        <AnimatedNumber value={cur ? cur.value : total} suffix=" ₽" duration={600} style={{ fontSize: 20, letterSpacing: -0.5 }} />
        {cur && sum > 0 && <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.accent }}>{Math.round((cur.value / sum) * 100)}%</Text>}
      </View>
    </View>
  );
}
