import { Tabs } from 'expo-router/js-tabs';
import { FloatingTabBar } from '../../components/FloatingTabBar';
import { useTheme } from '../../theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная' }} />
      <Tabs.Screen name="operations" options={{ title: 'Операции' }} />
      <Tabs.Screen name="ai" options={{ title: 'AI' }} />
      <Tabs.Screen name="goals" options={{ title: 'Цели' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Аналитика' }} />
    </Tabs>
  );
}
