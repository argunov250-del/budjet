import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Modal, Platform, Pressable, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_WIDTH, useTheme } from '../theme';
import { KScrollView, useKeyboardOverlap } from './keyboard';
import type { ViewRef } from './keyboard';

type Props = { visible: boolean; onClose: () => void; children: ReactNode; /** rendered over the whole sheet, outside the scroll area */ overlay?: ReactNode };

export function BottomSheet({ visible, onClose, children, overlay }: Props) {
  const { colors, shadows } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const root = useRef<ViewRef>(null);
  const kb = useKeyboardOverlap(root);
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(height);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      y.value = height;
      y.value = withSpring(0, { damping: 17, stiffness: 140, mass: 0.9 });
      fade.value = withTiming(1, { duration: 350 });
    } else if (mounted) {
      fade.value = withTiming(0, { duration: 250 });
      y.value = withTiming(height, { duration: 300 }, (done) => {
        if (done) scheduleClose();
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => sub.remove();
  }, [visible, onClose]);

  const pan = Gesture.Pan()
    .onUpdate((e) => { y.value = Math.max(0, e.translationY); })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 800) runOnJS(onClose)();
      else y.value = withSpring(0, { damping: 17, stiffness: 140, mass: 0.9 });
    });
  const scheduleClose = () => { setTimeoutJS(() => setMounted(false)); };

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const back = useAnimatedStyle(() => ({ opacity: fade.value }));
  const blur = Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as object) : null;

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View ref={root} collapsable={false} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim }, blur, back]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Закрыть" />
        </Animated.View>
        <Animated.View
          style={[
            {
              alignSelf: 'center', width: '100%', maxWidth: MAX_WIDTH, backgroundColor: colors.bg,
              borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 0, maxHeight: height - insets.top - 24 - kb, marginBottom: kb,
              paddingBottom: kb ? 12 : 12 + insets.bottom, boxShadow: shadows.sheet,
            },
            sheet,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View style={{ paddingTop: 14, paddingBottom: 14, alignItems: 'center' }} collapsable={false}>
              <View style={{ width: 42, height: 5, borderRadius: 9, backgroundColor: colors.track, boxShadow: shadows.inset }} />
            </View>
          </GestureDetector>
          <KScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }} bounces={false}>
            {children}
          </KScrollView>
          {overlay}
        </Animated.View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function setTimeoutJS(fn: () => void) { setTimeout(fn, 0); }
