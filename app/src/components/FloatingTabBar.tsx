import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_WIDTH, useTheme } from '../theme';
import type { IconName } from '../store/types';
import { Icon } from './Icon';
import { tap } from './haptics';

export const TAB_ICONS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'house', label: 'Главная' },
  operations: { icon: 'list', label: 'Операции' },
  ai: { icon: 'sparkles', label: 'AI' },
  goals: { icon: 'target', label: 'Цели' },
  analytics: { icon: 'bars', label: 'Аналитика' },
};
const ORDER = ['index', 'operations', 'ai', 'goals', 'analytics'];

export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const slot = w > 0 ? (w - 16) / 5 : 0;
  const x = useSharedValue(0);
  const activeName = state.routes[state.index]?.name;
  const idx = Math.max(0, ORDER.indexOf(activeName));
  useEffect(() => {
    x.value = withSpring(idx * slot, { damping: 13, stiffness: 170, mass: 0.8 });
  }, [idx, slot, x]);
  const ind = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 14 + insets.bottom, alignItems: 'center' }}>
      <View
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        style={{
          width: '100%', maxWidth: Math.min(388, MAX_WIDTH - 32), marginHorizontal: 16, padding: 8, borderRadius: 99,
          backgroundColor: colors.bg, boxShadow: shadows.raised, flexDirection: 'row',
        }}
      >
        <Animated.View
          style={[{ position: 'absolute', top: 8, bottom: 8, left: 8, width: slot, borderRadius: 99, backgroundColor: colors.bg, boxShadow: shadows.inset }, ind]}
        />
        {ORDER.map((name) => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;
          const focused = activeName === name;
          const meta = TAB_ICONS[name];
          return (
            <TabButton
              key={name}
              focused={focused}
              label={meta.label}
              icon={meta.icon}
              color={focused ? colors.accent : colors.text2}
              onPress={() => {
                tap();
                const ev = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !ev.defaultPrevented) navigateToTab(route.key);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabButton({ focused, label, icon, color, onPress }: { focused: boolean; label: string; icon: IconName; color: string; onPress: () => void }) {
  const s = useSharedValue(1);
  const k = useSharedValue(focused ? 1.12 : 1);
  useEffect(() => { k.value = withSpring(focused ? 1.12 : 1, { damping: 10, stiffness: 200 }); }, [focused, k]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value * k.value }] }));
  return (
    <Pressable
      accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: focused }}
      onPress={onPress}
      onPressIn={() => { s.value = withSpring(0.88, { damping: 12, stiffness: 300 }); }}
      onPressOut={() => { s.value = withSpring(1, { damping: 8, stiffness: 220 }); }}
      style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={a}><Icon name={icon} color={color} size={24} /></Animated.View>
    </Pressable>
  );
}
