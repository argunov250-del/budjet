import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedNumber, FadeInUp, NeuInput, Icon, NeuCard, Screen, formatRub, tap, useToast } from '../../components';
import { MAX_WIDTH, fontFamily, useTheme } from '../../theme';
import { useBudgetStore, type Category } from '../../store';
import { dayKey, isExpense, monthOps } from '../../logic/budget';
import { describeTx } from '../../screens/shared/txInfo';
import { SelChip } from '../../screens/shared/ui';
import { AddSheet } from '../../screens/operations/AddSheet';
import { TxRow } from '../../screens/operations/TxRow';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const SPRING = { damping: 20, stiffness: 140, mass: 0.7 };
const DAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MON_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function dayTitle(d: Date, now: Date) {
  const diff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
  const base = `${d.getDate()} ${MON_GEN[d.getMonth()]}`;
  if (diff === 0) return `Сегодня, ${base}`;
  if (diff === 1) return `Вчера, ${base}`;
  return `${base}, ${DAYS[d.getDay()]}`;
}

function Tile({ c, label, active, amount, onPress }: { c?: Category; label: string; active: boolean; amount: number; onPress: () => void }) {
  const { colors, shadows } = useTheme();
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      style={{ width: '48%' }}
      onPressIn={() => { s.value = withSpring(0.95, SPRING); tap(); }}
      onPressOut={() => { s.value = withSequence(withSpring(1.02, SPRING), withSpring(1, SPRING)); }}
      onPress={onPress}
    >
      <Animated.View style={[{ padding: 14, borderRadius: 26, gap: 4, backgroundColor: colors.bg, boxShadow: active ? shadows.inset : shadows.raisedS }, st]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.insetS }}>
            <Icon name={c?.icon ?? 'list'} size={14} color={active ? c?.color ?? colors.accent : colors.text2} />
          </View>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.navy }}>{label}</Text>
        </View>
        <AnimatedNumber value={amount} duration={700} suffix=" ₽" style={{ fontFamily: fontFamily.bold, fontSize: 13, color: colors.text2 }} />
      </Animated.View>
    </Pressable>
  );
}

export default function OperationsScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { categories, transactions, accounts, lastAccountId, addTransaction, removeTransaction } = useBudgetStore();
  const [acc, setAcc] = useState<string | null>(null);
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState(false);
  const now = new Date();

  const monthTx = useMemo(
    () => monthOps(transactions, month).filter((t) => !acc || t.accountId === acc || t.toAccountId === acc),
    [transactions, month, acc],
  );
  const perCat = useMemo(() => {
    const m: Record<string, number> = {};
    monthTx.filter(isExpense).forEach((t) => { m[t.categoryId] = (m[t.categoryId] ?? 0) + t.amount; });
    return m;
  }, [monthTx]);
  const total = monthTx.filter(isExpense).reduce((a, t) => a + t.amount, 0);

  const groups = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const list = monthTx
      .filter((t) => !cat || t.categoryId === cat)
      .filter((t) => !ql || t.note.toLowerCase().includes(ql) || describeTx(t, categories, accounts).sub.toLowerCase().includes(ql))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const g = new Map<string, { date: Date; items: typeof list; sum: number }>();
    list.forEach((t) => {
      const d = new Date(t.date);
      const k = dayKey(d);
      const e = g.get(k) ?? { date: d, items: [], sum: 0 };
      e.items.push(t); if (isExpense(t)) e.sum += t.amount; g.set(k, e);
      return;
    });
    return [...g.entries()];
  }, [monthTx, cat, q, categories, accounts]);

  const shift = (n: number) => { tap(); setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1)); };
  const isCurrent = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const arrow = (dir: number, disabled?: boolean) => (
    <Pressable disabled={disabled} onPress={() => shift(dir)} hitSlop={8}
      style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: shadows.raisedS, opacity: disabled ? 0.4 : 1 }}>
      <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 18, color: colors.navy }}>{dir < 0 ? '‹' : '›'}</Text>
    </Pressable>
  );

  return (
    <>
      <Screen>
        <FadeInUp index={0}>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy }}>Операции</Text>
        </FadeInUp>
        <FadeInUp index={1}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {arrow(-1)}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 17, color: colors.navy }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Text>
              <AnimatedNumber value={total} duration={900} prefix="Потрачено " suffix=" ₽" style={{ fontFamily: fontFamily.semibold, fontSize: 12.5, color: colors.text2 }} />
            </View>
            {arrow(1, isCurrent)}
          </View>
        </FadeInUp>
        {accounts.length > 1 && (
          <FadeInUp index={2}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4, paddingHorizontal: 2 }}>
              <SelChip label="Все счета" active={acc === null} onPress={() => setAcc(null)} />
              {accounts.map((a) => <SelChip key={a.id} label={`${a.icon} ${a.name}${a.archived ? ' (архив)' : ''}`} active={acc === a.id} onPress={() => setAcc(acc === a.id ? null : a.id)} />)}
            </ScrollView>
          </FadeInUp>
        )}
        <FadeInUp index={2}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
            <Tile label="Все" active={cat === null} amount={total} onPress={() => setCat(null)} />
            {categories.map((c) => (
              <Tile key={c.id} c={c} label={c.name} active={cat === c.id} amount={perCat[c.id] ?? 0} onPress={() => setCat(cat === c.id ? null : c.id)} />
            ))}
          </View>
        </FadeInUp>
        <FadeInUp index={3}>
          <NeuInput value={q} onChangeText={setQ} placeholder="Поиск по операциям" small />
        </FadeInUp>
        <NeuCard padding={16}>
          {groups.length === 0 ? (
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: 13.5, color: colors.text2, textAlign: 'center', paddingVertical: 20 }}>{transactions.length === 0 ? 'Операций пока нет. Нажмите «+», чтобы добавить первую' : 'Ничего не найдено'}</Text>
          ) : (
            groups.map(([k, g], gi) => (
              <Animated.View key={k} layout={LinearTransition.duration(300)} style={{ marginTop: gi ? 8 : 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: 6 }}>
                  <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.text2 }}>{dayTitle(g.date, now)}</Text>
                  {g.sum > 0 && <AnimatedNumber value={g.sum} duration={700} format={(n) => formatRub(n).replace('−', '')} prefix="−" style={{ fontFamily: fontFamily.extrabold, fontSize: 13, color: colors.navy }} />}
                </View>
                {g.items.map((t, i) => (
                  <TxRow key={t.id} tx={t} index={i} categories={categories} accounts={accounts} onDelete={() => { removeTransaction(t.id); toast.show('Операция удалена'); }} />
                ))}
              </Animated.View>
            ))
          )}
        </NeuCard>
      </Screen>
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 96 + insets.bottom, alignItems: 'center' }}>
        <View pointerEvents="box-none" style={{ width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: 16, alignItems: 'flex-end' }}>
          <Fab onPress={() => setSheet(true)} />
        </View>
      </View>
      <AddSheet
        visible={sheet} onClose={() => setSheet(false)} categories={categories}
        accounts={accounts} defaultAccountId={acc ?? lastAccountId}
        onSubmit={({ date, ...rest }) => {
          const amount = rest.amount;
          addTransaction({ ...rest, date: date.toISOString() });
          setSheet(false);
          toast.show(`Добавлено: ${formatRub(amount)}`);
        }}
      />
    </>
  );
}

function Fab({ onPress }: { onPress: () => void }) {
  const { colors, shadows } = useTheme();
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Добавить операцию" onPress={() => { tap(); onPress(); }} onPressIn={() => { s.value = withSpring(0.97, SPRING); }} onPressOut={() => { s.value = withSpring(1, SPRING); }}>
      <Animated.View style={[{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink, boxShadow: shadows.pill }, st]}>
        <Icon name="plus" size={26} color={colors.inkText} strokeWidth={2.4} />
      </Animated.View>
    </Pressable>
  );
}
