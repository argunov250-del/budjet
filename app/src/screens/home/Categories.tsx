import { Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { AnimatedNumber, FadeInUp, Icon, NeuCard, ProgressBar, formatNumber } from '../../components';
import type { CategorySpent } from '../../logic/budget';
import { fontFamily, useTheme } from '../../theme';

function Tile({ item, index, onPress }: { item: CategorySpent; index: number; onPress: () => void }) {
  const { colors, shadows } = useTheme();
  return (
    <FadeInUp delay={(4 + index) * 70} style={{ flex: 1 }}>
      <NeuCard onPress={onPress} radius={26} padding={16} style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.inset }}>
            <Icon name={item.category.icon} size={14} color={colors.text2} />
          </View>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: fontFamily.extrabold, fontSize: 15, color: colors.navy }}>{item.category.name}</Text>
        </View>
        <Text style={{ marginTop: 4, marginBottom: 2, fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }} numberOfLines={1}>
          <AnimatedNumber value={item.spent} style={{ fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.navy }} />
          {item.category.monthlyLimit > 0 ? ` / ${formatNumber(item.category.monthlyLimit)} ₽` : ' ₽'}
        </Text>
        <ProgressBar value={item.ratio} delay={500 + index * 54} />
      </NeuCard>
    </FadeInUp>
  );
}

export function Categories({ items, onPress }: { items: CategorySpent[]; onPress: () => void }) {
  const rows = [items.slice(0, 2), items.slice(2, 4)];
  return (
    <Animated.View layout={LinearTransition.springify().damping(20)} style={{ gap: 14 }}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 14 }}>
          {r.map((it, i) => <Tile key={it.category.id} item={it} index={ri * 2 + i} onPress={onPress} />)}
        </View>
      ))}
    </Animated.View>
  );
}
