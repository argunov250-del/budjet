import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { FadeInUp, Screen, tap, useToast } from '../../components';
import { categorySpent, dailyLimit, monthSeries, streak } from '../../logic/budget';
import { useBudgetStore } from '../../store';
import { fontFamily, useTheme } from '../../theme';
import { Categories } from './Categories';
import { FillHint } from './FillHint';
import { Header } from './Header';
import { MainCard } from './MainCard';
import { AccountsStrip } from './AccountsStrip';
import { RecentOps } from './RecentOps';
import { fillSuggestions, MONTHS_NOM, useNow } from './helpers';

const L = LinearTransition.springify().damping(20).stiffness(120);

function Section({ title, small, onPress }: { title: string; small: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, marginHorizontal: 4, marginBottom: -4 }}>
      <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 17, color: colors.navy }}>{title}</Text>
      <Pressable onPress={onPress} hitSlop={10} disabled={!onPress}>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{small}</Text>
      </Pressable>
    </View>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const toast = useToast();
  const { transactions, categories, accounts, settings, addTransaction, removeTransaction } = useBudgetStore();
  const now = useNow(transactions);
  const [filled, setFilled] = useState(0);

  const dl = useMemo(() => dailyLimit(transactions, settings, now), [transactions, settings, now]);
  const series = useMemo(() => monthSeries(transactions, settings, now), [transactions, settings, now]);
  const cats = useMemo(() => {
    const all = categorySpent(transactions, categories, now);
    // show the most-spent categories first; with no data keep the default order
    return [...all].sort((a, b) => b.spent - a.spent).slice(0, 4);
  }, [transactions, categories, now]);
  const st = useMemo(() => streak(transactions, settings, now), [transactions, settings, now]);
  const info = useMemo(() => fillSuggestions(transactions, now), [transactions, now]);
  const recent = useMemo(
    () => [...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5),
    [transactions],
  );

  const fill = useCallback(() => {
    if (!info) return;
    info.missing.forEach((m) => addTransaction({ amount: m.amount, categoryId: m.categoryId, note: m.note, date: m.date, accountId: m.accountId }));
    setFilled(info.missing.length);
  }, [info, addTransaction]);

  const del = useCallback((id: string) => {
    removeTransaction(id);
    toast.show('Операция удалена');
  }, [removeTransaction, toast]);

  const goOps = () => { tap(); router.navigate('/operations'); };
  const monthName = MONTHS_NOM[now.getMonth()];

  return (
    <>
      <Screen>
        <FadeInUp index={0}><Header now={now} streak={st} /></FadeInUp>
        {(info || filled > 0) && (
          <Animated.View layout={L}>
            <FadeInUp index={1}><FillHint info={info} filled={filled} onFill={fill} /></FadeInUp>
          </Animated.View>
        )}
        <FadeInUp index={1}><AccountsStrip accounts={accounts} txs={transactions} onAdd={() => { tap(); router.push('/settings' as never); }} /></FadeInUp>
        <Animated.View layout={L}><FadeInUp index={2}><MainCard dl={dl} series={series} now={now} /></FadeInUp></Animated.View>
        <FadeInUp index={3}><Section title="Категории" small={monthName} /></FadeInUp>
        <Categories items={cats} onPress={goOps} />
        <FadeInUp index={5}><Section title="Последние операции" small="все" onPress={goOps} /></FadeInUp>
        <FadeInUp index={6}><RecentOps txs={recent} categories={categories} accounts={accounts} now={now} onDelete={del} /></FadeInUp>
      </Screen>
    </>
  );
}
