import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { fontFamily, useTheme } from '../theme';

type Props = { label: string; icon?: ReactNode; style?: StyleProp<ViewStyle> };

/** Inset pill chip (prototype .chip) */
export function Chip({ label, icon, style }: Props) {
  const { colors, shadows } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          paddingVertical: 7, paddingLeft: 9, paddingRight: 12, borderRadius: 99,
          backgroundColor: colors.bg, boxShadow: shadows.inset,
        },
        style,
      ]}
    >
      {icon}
      <Text style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.navy }}>{label}</Text>
    </View>
  );
}
