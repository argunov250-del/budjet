import { useRef, useState, type ComponentRef } from 'react';
import { Platform } from 'react-native';
import { useScrollIntoView } from './keyboard';
import { TextInput, type TextInputProps } from 'react-native';
import { fontFamily, useTheme } from '../theme';

/** Single inset text field used everywhere. Identical padding for placeholder and value (no filled-state styles). */
export function NeuInput({ small, style, onFocus, onBlur, multiline, ...rest }: TextInputProps & { small?: boolean }) {
  const { colors, shadows } = useTheme();
  const [focus, setFocus] = useState(false);
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  const reveal = useScrollIntoView();
  return (
    <TextInput
      placeholderTextColor={colors.text2}
      multiline={multiline}
      {...rest}
      ref={ref}
      onFocus={(e) => { setFocus(true); onFocus?.(e); setTimeout(() => reveal(ref.current), Platform.OS === 'android' ? 350 : 120); }}
      onBlur={(e) => { setFocus(false); onBlur?.(e); }}
      style={[
        {
          backgroundColor: colors.bg, borderRadius: 20,
          paddingHorizontal: 20, paddingVertical: small ? 12 : 16,
          fontFamily: fontFamily.semibold, fontSize: 16, color: colors.navy,
          includeFontPadding: false, textAlignVertical: multiline ? 'top' : 'center',
          boxShadow: focus ? `${shadows.inset}, 0px 0px 0px 2px ${colors.accent}` : shadows.inset,
          outlineStyle: 'none',
        } as object,
        style,
      ]}
    />
  );
}
