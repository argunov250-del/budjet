import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { fontFamily, useTheme } from '../../theme';

/** Inset text field (prototype .inp) */
export function Field(props: TextInputProps) {
  const { colors, shadows } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.text2}
      {...props}
      onFocus={(e) => { setFocus(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); props.onBlur?.(e); }}
      style={[
        {
          backgroundColor: colors.bg, borderRadius: 20, padding: 16, fontFamily: fontFamily.semibold, fontSize: 16,
          color: colors.navy, boxShadow: focus ? `${shadows.inset}, 0px 0px 0px 2px ${colors.accent}` : shadows.inset,
          outlineStyle: 'none',
        } as object,
        props.style,
      ]}
    />
  );
}

export const digits = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
