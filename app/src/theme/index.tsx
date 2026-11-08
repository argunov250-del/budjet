import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, type Palette } from './tokens';
import { shadows, type Shadows } from './shadows';

export * from './tokens';
export * from './typography';
export * from './shadows';

export type Theme = { isDark: boolean; colors: Palette; shadows: Shadows };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return useMemo(() => {
    const colors = isDark ? dark : light;
    return { isDark, colors, shadows: shadows(colors) };
  }, [isDark]);
}
