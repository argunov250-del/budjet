import { createContext, type ComponentRef, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Keyboard, Platform, ScrollView, View, type ScrollViewProps } from 'react-native';

/**
 * Android (edge-to-edge) does not reliably resize Modal windows / screens for the IME.
 * We measure how much of `ref` the keyboard actually covers and return that overlap (0 when the
 * window was already resized by the system, so there is no double adjustment).
 */
export type ViewRef = ComponentRef<typeof View>;
export type ScrollRef = ComponentRef<typeof ScrollView>;
export function useKeyboardOverlap(ref: RefObject<ViewRef | null>): number {
  const [overlap, setOverlap] = useState(0);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (e) => {
      const top = e.endCoordinates.screenY;
      const measure = () => ref.current?.measureInWindow((_x, y, _w, h) => setOverlap(Math.max(0, Math.round(y + h - top))));
      measure();
      if (Platform.OS === 'android') setTimeout(measure, 120);
    });
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOverlap(0));
    return () => { show.remove(); hide.remove(); };
  }, [ref]);
  return overlap;
}

type Ctx = { scroll: RefObject<ScrollRef | null> };
const ScrollCtx = createContext<Ctx | null>(null);

/** Scrolls the nearest KScrollView so that `input` is visible (used by NeuInput on focus). */
export function useScrollIntoView() {
  const ctx = useContext(ScrollCtx);
  return useCallback((input: { measureLayout: (...a: never[]) => void } | null) => {
    const sv = ctx?.scroll.current;
    if (!sv || !input) return;
    const inner = (sv as unknown as { getInnerViewRef?: () => unknown }).getInnerViewRef?.();
    if (!inner) return;
    try {
      (input.measureLayout as (...a: unknown[]) => void)(inner, (_x: number, y: number) => sv.scrollTo({ y: Math.max(0, y - 96), animated: true }), () => {});
    } catch { /* ignore */ }
  }, [ctx]);
}

/** ScrollView that taps through to inputs/buttons and lets focused inputs scroll themselves into view. */
export function KScrollView({ children, ...rest }: ScrollViewProps & { children?: ReactNode }) {
  const ref = useRef<ScrollRef>(null);
  return (
    <ScrollCtx.Provider value={{ scroll: ref }}>
      <ScrollView ref={ref} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} {...rest}>
        {children}
      </ScrollView>
    </ScrollCtx.Provider>
  );
}
