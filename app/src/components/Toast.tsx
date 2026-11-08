import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily, useTheme } from '../theme';

type Ctx = { show: (message: string, ms?: number) => void };
const ToastCtx = createContext<Ctx>({ show: () => {} });
export const useToast = () => useContext(ToastCtx);

/** Mount once at the root; call `useToast().show('...')` anywhere. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState('');
  const p = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string, ms = 1800) => {
    setMsg(m);
    p.value = withSpring(1, { damping: 12, stiffness: 160 });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { p.value = withTiming(0, { duration: 250 }); }, ms);
  }, [p]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const a = useAnimatedStyle(() => ({
    opacity: Math.min(1, p.value),
    transform: [{ translateY: (1 - p.value) * 20 }, { scale: 0.9 + 0.1 * p.value }],
  }));
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 92 + insets.bottom, alignItems: 'center', zIndex: 30 }}>
        <Animated.View style={[{ backgroundColor: colors.ink, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 99, boxShadow: shadows.toast }, a]}>
          <Text style={{ color: colors.inkText, fontFamily: fontFamily.bold, fontSize: 13 }}>{msg}</Text>
        </Animated.View>
      </View>
    </ToastCtx.Provider>
  );
}
