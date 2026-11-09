import { ScrollView, Text, View } from 'react-native';
import { AnimatedNumber, NeuCard, formatRub } from '../../components';
import { accountBalance, totalBalance } from '../../logic/budget';
import type { Account, Transaction } from '../../store/types';
import { fontFamily, useTheme } from '../../theme';
import { PressScale } from '../shared/ui';

export function AccountsStrip({ accounts, txs, onAdd }: { accounts: Account[]; txs: Transaction[]; onAdd: () => void }) {
  const { colors, shadows } = useTheme();
  const active = accounts.filter((a) => !a.archived);
  const total = totalBalance(accounts, txs);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginHorizontal: 4 }}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 17, color: colors.navy }}>Счета</Text>
        <AnimatedNumber value={total} duration={900} prefix="Всего " suffix=" ₽" style={{ fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.text2 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4, paddingVertical: 8, alignItems: 'flex-start' }} style={{ marginHorizontal: -16, flexGrow: 0 }}>
        <View style={{ width: 12 }} />
        {active.map((a) => (
          <NeuCard key={a.id} radius={24} padding={14} small style={{ width: 150, height: 110, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.insetS }}>
                <Text style={{ fontSize: 14 }}>{a.icon}</Text>
              </View>
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.navy }}>{a.name}</Text>
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: fontFamily.extrabold, fontSize: 18, color: accountBalance(a, txs) < 0 ? colors.accent : colors.navy, fontVariant: ['tabular-nums'] }}>
              {formatRub(accountBalance(a, txs))}
            </Text>
            <View style={{ height: 3, borderRadius: 2, width: 28, backgroundColor: a.color }} />
          </NeuCard>
        ))}
        <PressScale onPress={onAdd} label="Добавить счёт"
          style={{ width: 70, height: 110, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: shadows.inset }}>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 24, color: colors.text2 }}>＋</Text>
        </PressScale>
        <View style={{ width: 12 }} />
      </ScrollView>
    </View>
  );
}
