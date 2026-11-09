import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { tap } from '../../components';
import { fontFamily, useTheme } from '../../theme';

const SPRING = { damping: 20, stiffness: 140, mass: 0.7 };

/** Pressable with spring scale + opacity feedback (no ripple / highlight). */
export function PressScale({ children, onPress, style, disabled, scale = 0.97, label }: {
  children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; disabled?: boolean; scale?: number; label?: string;
}) {
  const s = useSharedValue(1);
  const o = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));
  return (
    <Pressable
      disabled={disabled} onPress={onPress} accessibilityLabel={label}
      onPressIn={() => { s.value = withSpring(scale, SPRING); o.value = withSpring(0.85, SPRING); }}
      onPressOut={() => { s.value = withSpring(1, SPRING); o.value = withSpring(1, SPRING); }}
    >
      <Animated.View style={[style, st]}>{children}</Animated.View>
    </Pressable>
  );
}

/** neumorphic selectable chip */
export function SelChip({ label, active, onPress, dot }: { label: string; active: boolean; onPress: () => void; dot?: string }) {
  const { colors, shadows } = useTheme();
  return (
    <PressScale onPress={() => { tap(); onPress(); }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, backgroundColor: colors.bg, boxShadow: active ? shadows.inset : shadows.raisedS }}>
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
      <Text style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: active ? colors.navy : colors.text2 }}>{label}</Text>
    </PressScale>
  );
}

/** Animated segmented control: sliding inset thumb. */
export function Segmented<T extends string>({ items, value, onChange }: { items: { key: T; label: string }[]; value: T; onChange: (k: T) => void }) {
  const { colors, shadows } = useTheme();
  const [w, setW] = useState(0);
  const idx = Math.max(0, items.findIndex((i) => i.key === value));
  const seg = w / items.length;
  const x = useSharedValue(0);
  const first = useSharedValue(true);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const target = idx * seg;
  useEffect(() => {
    if (w <= 0) return;
    if (first.value) { x.value = target; first.value = false; } else x.value = withSpring(target, { damping: 20, stiffness: 140, mass: 0.8 });
  }, [w, target]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width - 8)}
      style={{ flexDirection: 'row', padding: 4, borderRadius: 20, backgroundColor: colors.bg, boxShadow: shadows.inset }}>
      {w > 0 && (
        <Animated.View style={[{ position: 'absolute', top: 4, left: 4, width: seg, bottom: 4, borderRadius: 16, backgroundColor: colors.bg, boxShadow: shadows.raisedS }, thumb]} />
      )}
      {items.map((i) => (
        <Pressable key={i.key} style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }} onPress={() => { if (i.key !== value) { tap(); onChange(i.key); } }}>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 13.5, color: i.key === value ? colors.navy : colors.text2 }}>{i.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
