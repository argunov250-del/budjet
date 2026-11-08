import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily, gradients, useTheme } from '../theme';

export function Avatar({ letter = 'А', size = 52 }: { letter?: string; size?: number }) {
  const { shadows } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, boxShadow: shadows.avatar }}>
      <LinearGradient colors={[...gradients.avatar]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontFamily: fontFamily.extrabold, fontSize: size * 0.385 }}>{letter}</Text>
      </LinearGradient>
    </View>
  );
}
