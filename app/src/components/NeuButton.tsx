import { Pressable, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import { fontFamily, useTheme } from '../theme';
import { tap } from './haptics';

type Props = {
  title: string;
  onPress?: () => void;
  /** 'pill' = dark ink pill (prototype .pill); 'neu' = raised neumorphic button */
  variant?: 'pill' | 'neu';
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function NeuButton({ title, onPress, variant = 'pill', disabled, full, style, textStyle }: Props) {
  const { colors, shadows } = useTheme();
  const s = useSharedValue(1);
  const [down, setDown] = useState(false);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const pill = variant === 'pill';
  const shadow = pill ? (down ? shadows.pillPressed : shadows.pill) : down ? shadows.inset : shadows.raisedS;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => { setDown(true); s.value = withSpring(0.97, { damping: 20, stiffness: 140 }); tap(); }}
      onPressOut={() => { setDown(false); s.value = withSpring(1, { damping: 20, stiffness: 140 }); }}
      style={full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: pill ? colors.ink : colors.bg,
            borderRadius: 99,
            paddingVertical: full ? 15 : 10,
            paddingHorizontal: 20,
            alignItems: 'center',
            boxShadow: shadow,
            opacity: disabled ? 0.55 : 1,
          },
          a,
          style,
        ]}
      >
        <Text style={[{ fontFamily: fontFamily.bold, fontSize: full ? 15 : 13.5, color: pill ? colors.inkText : colors.navy }, textStyle]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
