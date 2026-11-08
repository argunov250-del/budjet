import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useSharedValue, withDelay, withRepeat, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import type { MonthSeries } from '../logic/budget';
import { fontFamily, useTheme } from '../theme';
import { formatNumber } from './format';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const W = 320, H = 150, X0 = 20, X1 = 300, YB = 125, YH = 105;

type Props = {
  series: MonthSeries;
  /** x tick labels as [day, text]; default 1 / 8 / 15 / 22 / last */
  ticks?: [number, string][];
  duration?: number;
};

/** Step line of cumulative spend (draws in via strokeDashoffset), dotted ideal-pace line, pulsing glow dot + value label. */
export function PaceChart({ series, ticks, duration = 1800 }: Props) {
  const { colors } = useTheme();
  const n = series.daysInMonth;
  const geo = useMemo(() => {
    const max = Math.max(series.ideal[n - 1]?.value ?? 1, series.total, 1);
    const X = (d: number) => X0 + ((d - 1) / Math.max(1, n - 1)) * (X1 - X0);
    const Y = (v: number) => YB - (v / max) * YH;
    let d = '';
    let len = 0;
    let px = X(1), py = Y(0), cum = 0;
    series.cumulative.forEach((pt, i) => {
      const x = X(pt.day);
      if (i === 0) d += `M${x.toFixed(1)} ${Y(0).toFixed(1)}`;
      else { d += ` L${x.toFixed(1)} ${py.toFixed(1)}`; len += Math.abs(x - px); px = x; }
      cum = pt.value;
      const y = Y(cum);
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      len += Math.abs(y - py); py = y;
    });
    const ex = px, ey = py;
    return { d, len: Math.max(1, len), X, Y, ex, ey, max };
  }, [series, n]);

  const draw = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    draw.value = 0;
    draw.value = withDelay(300, withTiming(1, { duration, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
  }, [geo.d, duration, draw]);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: geo.len * (1 - draw.value) }));
  const pulseProps = useAnimatedProps(() => ({ r: 6 * (0.6 + pulse.value * 2.0), opacity: 0.7 * (1 - pulse.value) }));

  const tk = ticks ?? ([[1, '1 нояб'], [8, '8'], [15, '15'], [22, '22'], [n, String(n)]] as [number, string][]);
  const label = `${formatNumber(series.total)} ₽`;
  const labelAnchorEnd = geo.ex > 230;

  return (
    <View style={{ width: '100%', aspectRatio: W / H }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {[0, 1, 2].map((k) => (
          <Line key={k} x1={X0} x2={X1} y1={YB - k * 35} y2={YB - k * 35} stroke={colors.track} strokeWidth={1} />
        ))}
        <Line
          x1={geo.X(1)} y1={geo.Y(series.ideal[0]?.value ?? 0)} x2={geo.X(n)} y2={geo.Y(series.ideal[n - 1]?.value ?? 0)}
          stroke={colors.text2} strokeWidth={1.5} strokeDasharray="2 5" strokeLinecap="round" opacity={0.7}
        />
        <Line
          x1={geo.ex} x2={geo.ex} y1={geo.ey} y2={128}
          stroke={colors.accent} strokeWidth={1.2} strokeDasharray="2 4" strokeLinecap="round" opacity={0.7}
        />
        {/* glow under the line (drop-shadow substitute) */}
        <Path d={geo.d} fill="none" stroke={colors.accentGlow} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" opacity={0.25} transform="translate(0 3)" />
        <AnimatedPath
          d={geo.d} fill="none" stroke={colors.accent} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray={`${geo.len} ${geo.len}`} animatedProps={lineProps}
        />
        <AnimatedCircle cx={geo.ex} cy={geo.ey} fill={colors.accent} animatedProps={pulseProps} />
        <Circle cx={geo.ex} cy={geo.ey} r={5} fill={colors.bg} stroke={colors.accent} strokeWidth={3} />
        <SvgText
          x={labelAnchorEnd ? geo.ex - 6 : geo.ex + 6} y={geo.ey - 13}
          textAnchor={labelAnchorEnd ? 'end' : 'middle'}
          fontFamily={fontFamily.extrabold} fontSize={10.5} fill={colors.navy}
        >
          {label}
        </SvgText>
        {tk.map(([d, t], i) => (
          <SvgText
            key={d} x={i === 0 ? X0 : geo.X(d)} y={144}
            textAnchor={i === 0 ? 'start' : i === tk.length - 1 ? 'end' : 'middle'}
            fontFamily={fontFamily.semibold} fontSize={9.5} fill={colors.text2}
          >
            {t}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
