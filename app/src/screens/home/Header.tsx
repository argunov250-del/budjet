import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { AnimatedNumber, tap } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import { dateLine, greeting, plural } from './helpers';

function Flame() {
  const s = useSharedValue(0);
  useEffect(() => {
    s.value = withRepeat(withSequence(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })), -1);
  }, [s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 + s.value * 0.12 }, { rotate: `${-4 * s.value}deg` }] }));
  return (
    <Animated.View style={a}>
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#FF5A1F" />
            <Stop offset="1" stopColor="#FFC107" />
          </LinearGradient>
        </Defs>
        <Path fill="url(#fg)" d="M12 2c.6 3.2 3 4.6 4.6 7 1.5 2.2 1.9 4.2 1.2 6.4A6.4 6.4 0 0 1 12 20a6.4 6.4 0 0 1-6-4.6c-.6-2 .2-4 1.4-5.4.2 1.2.9 2 1.8 2.3C8.7 8.4 10.2 5 12 2z" />
      </Svg>
    </Animated.View>
  );
}

export function Header({ now, streak }: { now: Date; streak: number }) {
  const { colors, shadows } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const k = useSharedValue(0);
  const av = useAnimatedStyle(() => ({ transform: [{ scale: 1 - k.value * 0.08 }] }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: insets.top + 12, paddingBottom: 4, paddingHorizontal: 2 }}>
      <View style={{ flexShrink: 1 }}>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }}>{dateLine(now)}</Text>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy, marginTop: 2, marginBottom: 10 }}>{greeting(now)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 7, paddingLeft: 9, paddingRight: 12, borderRadius: 99, backgroundColor: colors.bg, boxShadow: shadows.inset }}>
          <Flame />
          <AnimatedNumber value={streak} duration={1000} style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.navy }}
            suffix={` ${plural(streak, 'день', 'дня', 'дней')} в бюджете`} />
        </View>
      </View>
      <Pressable accessibilityLabel="Настройки"
        onPress={() => router.push('/settings' as any)}
        onPressIn={() => { k.value = withSpring(1, { damping: 14, stiffness: 220 }); tap(); }}
        onPressOut={() => { k.value = withSpring(0, { damping: 10, stiffness: 160 }); }}>
        <Animated.View style={[av, { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg, boxShadow: shadows.raisedS, alignItems: 'center', justifyContent: 'center' }]}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.navy} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={12} cy={12} r={3} />
            <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </Svg>
        </Animated.View>
      </Pressable>
    </View>
  );
}
