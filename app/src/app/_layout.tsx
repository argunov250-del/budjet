import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../components/Toast';
import { useHydrated, useBudgetStore } from '../store';
import { useTheme } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const hydrated = useHydrated();
  const hasAccounts = useBudgetStore((s) => s.accounts.length > 0);
  const [loaded, error] = useFonts({
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if ((!loaded && !error) || !hydrated) return null;

  const navTheme = {
    dark: isDark,
    colors: { primary: colors.accent, background: colors.bg, card: colors.bg, text: colors.navy, border: colors.bg, notification: colors.accent },
    fonts: {
      regular: { fontFamily: 'Manrope_400Regular', fontWeight: '400' as const },
      medium: { fontFamily: 'Manrope_500Medium', fontWeight: '500' as const },
      bold: { fontFamily: 'Manrope_700Bold', fontWeight: '700' as const },
      heavy: { fontFamily: 'Manrope_800ExtraBold', fontWeight: '800' as const },
    },
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <ToastProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Protected guard={hasAccounts}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
            </Stack.Protected>
            <Stack.Protected guard={!hasAccounts}>
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            </Stack.Protected>
          </Stack>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
