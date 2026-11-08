import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

const tab: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  h1: { fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5 } as TextStyle,
  h2: { fontFamily: fontFamily.extrabold, fontSize: 20 } as TextStyle,
  section: { fontFamily: fontFamily.extrabold, fontSize: 17 } as TextStyle,
  title: { fontFamily: fontFamily.extrabold, fontSize: 15 } as TextStyle,
  body: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 } as TextStyle,
  caption: { fontFamily: fontFamily.semibold, fontSize: 12 } as TextStyle,
  row: { fontFamily: fontFamily.semibold, fontSize: 12.5 } as TextStyle,
  rowTitle: { fontFamily: fontFamily.bold, fontSize: 14.5 } as TextStyle,
  amount: { fontFamily: fontFamily.extrabold, fontSize: 14.5, ...tab } as TextStyle,
  big: { fontFamily: fontFamily.extrabold, fontSize: 26, letterSpacing: -0.5, ...tab } as TextStyle,
  ringNumber: { fontFamily: fontFamily.extrabold, fontSize: 32, letterSpacing: -1, ...tab } as TextStyle,
  pill: { fontFamily: fontFamily.bold, fontSize: 13.5 } as TextStyle,
  input: { fontFamily: fontFamily.semibold, fontSize: 16 } as TextStyle,
  tabular: tab,
};
