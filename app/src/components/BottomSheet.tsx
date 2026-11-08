import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_WIDTH, useTheme } from '../theme';

type Props = { visible: boolean; onClose: () => void; children: ReactNode };

export function BottomSheet({ visible, onClose, children }: Props) {
  const { colors, shadows } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
  const scheduleClose = () => { setTimeoutJS(() => setMounted(false)); };

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const back = useAnimatedStyle(() => ({ opacity: fade.value }));
  const blur = Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as object) : null;

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim }, blur, back]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Закрыть" />
        </Animated.View>
        <Animated.View
          style={[
            {
              alignSelf: 'center', width: '100%', maxWidth: MAX_WIDTH, backgroundColor: colors.bg,
              borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 14, paddingHorizontal: 20,
              paddingBottom: 24 + insets.bottom, boxShadow: shadows.sheet,
            },
            sheet,
          ]}
        >
          <View style={{ width: 42, height: 5, borderRadius: 9, backgroundColor: colors.track, alignSelf: 'center', marginBottom: 14, boxShadow: shadows.inset }} />
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function setTimeoutJS(fn: () => void) { setTimeout(fn, 0); }
