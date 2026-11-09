import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, type Palette } from './tokens';
import { useBudgetStore } from '../store';
import { shadows, type Shadows } from './shadows';

export * from './tokens';
export * from './typography';
export * from './shadows';

export type Theme = { isDark: boolean; colors: Palette; shadows: Shadows };

export function useTheme(): Theme {
  const system = useColorScheme();
  const pref = useBudgetStore((s) => s.settings.theme);
  const isDark = pref === 'dark' || (pref !== 'light' && system === 'dark');
  return useMemo(() => {
    const colors = isDark ? dark : light;
    return { isDark, colors, shadows: shadows(colors) };
  }, [isDark]);
}
