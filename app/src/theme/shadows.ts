import type { ViewStyle } from 'react-native';
import type { Palette } from './tokens';

/** Neumorphic shadow strings (RN boxShadow, multi + inset). Mirrors prototype --raised/--raised-s/--inset. */
export function shadows(p: Palette) {
  const d = p.shDark;
  const l = p.shLight;
  return {
    raised: `7px 7px 18px ${d}, -7px -7px 18px ${l}`,
    raisedS: `4px 4px 10px ${d}, -4px -4px 10px ${l}`,
    inset: `inset 5px 5px 11px ${d}, inset -5px -5px 11px ${l}`,
    insetS: `inset 2px 2px 4px ${d}, inset -2px -2px 4px ${l}`,
    sheet: `0px -10px 40px ${d}`,
    pill: '0px 6px 14px rgba(18,32,63,0.25)',
    pillPressed: '0px 2px 5px rgba(18,32,63,0.3)',
    toast: '0px 8px 22px rgba(18,32,63,0.3)',
    avatar: `4px 4px 10px ${d}, -4px -4px 10px ${l}, 0px 0px 0px 4px ${p.bg}, 0px 0px 0px 5px ${l}`,
  };
}
export type Shadows = ReturnType<typeof shadows>;

type Opts = { radius?: number; padding?: number; small?: boolean };

/** Raised surface style. */
export function raised(p: Palette, o: Opts = {}): ViewStyle {
  const s = shadows(p);
  return {
    backgroundColor: p.bg,
    borderRadius: o.radius ?? 28,
    boxShadow: o.small ? s.raisedS : s.raised,
    ...(o.padding != null ? { padding: o.padding } : null),
  };
}

/** Pressed / inset (sunken) surface style. */
export function pressed(p: Palette, o: Opts = {}): ViewStyle {
  const s = shadows(p);
  return {
    backgroundColor: p.bg,
    borderRadius: o.radius ?? 28,
    boxShadow: o.small ? s.insetS : s.inset,
    ...(o.padding != null ? { padding: o.padding } : null),
  };
}
