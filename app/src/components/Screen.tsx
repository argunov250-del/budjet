import { useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KScrollView, useKeyboardOverlap } from './keyboard';
import type { ViewRef } from './keyboard';
import { MAX_WIDTH, useTheme } from '../theme';

/** Bottom space reserved for the floating tab bar */
export const TAB_BAR_SPACE = 160;

/** Standard scrolling screen: bg, safe-area top, 16px gutters, max 420 wide, gap 18, room for tab bar. */
export function Screen({ children, style, scroll = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; scroll?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const root = useRef<ViewRef>(null);
  const kb = useKeyboardOverlap(root);
  const content: ViewStyle = {
    width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 18,
    paddingHorizontal: 16, paddingTop: Math.max(20, insets.top), paddingBottom: TAB_BAR_SPACE + insets.bottom + kb,
  };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: colors.bg }, content, style]}>{children}</View>;
  return (
    <View ref={root} collapsable={false} style={{ flex: 1, backgroundColor: colors.bg }}>
      <KScrollView style={{ flex: 1 }} contentContainerStyle={[content, style, kb ? { paddingBottom: 24 + kb } : null]}>
        {children}
      </KScrollView>
    </View>
  );
}
