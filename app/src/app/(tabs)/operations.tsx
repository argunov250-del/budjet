import { Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { fontFamily, useTheme } from '../../theme';

export default function OperationsScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy }}>Операции</Text>
    </Screen>
  );
}
