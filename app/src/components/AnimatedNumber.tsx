import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { fontFamily, useTheme } from '../theme';
import { formatNumber } from './format';

type Props = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  /** custom formatter (default ru-RU thin-space grouping) */
  format?: (n: number) => string;
};

/** Count-up number: animates from previous value to `value` with easeOutQuart. */
export function AnimatedNumber({ value, duration = 1200, prefix = '', suffix = '', style, format = formatNumber }: Props) {
  const { colors } = useTheme();
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = from.current;
    let t0: number | null = null;
    const step = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 4);
      const v = start + (value - start) * e;
      from.current = v;
      setShown(v);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current != null) cancelAnimationFrame(raf.current); };
  }, [value, duration]);
  return (
    <Text style={[{ fontFamily: fontFamily.extrabold, color: colors.navy, fontVariant: ['tabular-nums'] }, style]}>
      {prefix}{format(shown)}{suffix}
    </Text>
  );
}
