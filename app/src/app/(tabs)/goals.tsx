import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheet, FadeInUp, NeuButton, NeuCard, Screen, formatRub, success, useToast } from '../../components';
import { GoalCard } from '../../screens/goals/GoalCard';
import { Field, digits } from '../../screens/goals/Field';
import { monthlyPool } from '../../screens/goals/pace';
import { useBudgetStore } from '../../store';
import { fontFamily, useTheme } from '../../theme';

const QUICK = [500, 1000, 5000];
const EMOJIS = ['🎯', '🏖️', '🛟', '🚗', '💻', '🏠', '🎁'];

export default function GoalsScreen() {
  const { colors, shadows } = useTheme();
  const toast = useToast();
  const goals = useBudgetStore((s) => s.goals);
  const txs = useBudgetStore((s) => s.transactions);
  const settings = useBudgetStore((s) => s.settings);
  const depositToGoal = useBudgetStore((s) => s.depositToGoal);
  const addGoal = useBudgetStore((s) => s.addGoal);

  const now = useMemo(() => new Date(), []);
  const active = goals.filter((g) => g.saved < g.target).length;
  const perMonth = monthlyPool(txs, settings, now) / Math.max(1, active);

  const [depositId, setDepositId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [bursts, setBursts] = useState<Record<string, number>>({});
  const burstCount = useRef(0);

  const goal = goals.find((g) => g.id === depositId);
  const remaining = goal ? Math.max(0, goal.target - goal.saved) : 0;
  const value = Math.min(digits(amount), remaining);

  const closeDeposit = () => { setDepositId(null); setAmount(''); };
  const submitDeposit = () => {
    if (!goal || value <= 0) return;
    const reaches = goal.saved + value >= goal.target;
    depositToGoal(goal.id, value);
    closeDeposit();
    toast.show(`+${formatRub(value)} в «${goal.name}»`);
    if (reaches) {
      setTimeout(() => {
        success();
        setBursts((b) => ({ ...b, [goal.id]: ++burstCount.current }));
      }, 900);
    }
  };

  const submitNew = () => {
    const t = digits(target);
    if (!name.trim() || t <= 0) return;
    addGoal({ name: name.trim(), target: t, saved: 0, emoji });
    setNewOpen(false); setName(''); setTarget(''); setEmoji(EMOJIS[0]);
    toast.show('Цель создана');
  };

  const title = (t: string) => <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 20, color: colors.navy, marginBottom: 4 }}>{t}</Text>;
  const sub = (t: string) => <Text style={{ fontFamily: fontFamily.medium, fontSize: 13, color: colors.text2, marginBottom: 14 }}>{t}</Text>;

  return (
    <>
      <Screen>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 }}>
          <View>
            <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy }}>Цели</Text>
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }}>Копим на важное</Text>
          </View>
          <NeuButton title="＋ Новая цель" variant="neu" onPress={() => setNewOpen(true)} />
        </View>

        {goals.length === 0 && (
          <NeuCard>
            <Text style={{ fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.navy, textAlign: 'center' }}>Пока нет целей — создайте первую</Text>
          </NeuCard>
        )}
        {goals.map((g, i) => (
          <FadeInUp key={g.id} index={i}>
            <GoalCard goal={g} perMonth={perMonth} now={now} burst={bursts[g.id] ?? 0} onDeposit={() => setDepositId(g.id)} />
          </FadeInUp>
        ))}
      </Screen>

      <BottomSheet visible={!!goal} onClose={closeDeposit}>
        {title('Пополнить')}
        {sub(goal ? `«${goal.name}» · осталось ${formatRub(remaining)}` : '')}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          {QUICK.map((q) => (
            <Pressable key={q} style={{ flex: 1 }} onPress={() => setAmount(String(Math.min(remaining, digits(amount) + q)))}>
              <View style={{ paddingVertical: 12, borderRadius: 99, alignItems: 'center', backgroundColor: colors.bg, boxShadow: shadows.raisedS }}>
                <Text style={{ fontFamily: fontFamily.bold, fontSize: 14, color: colors.navy }}>+{q}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Field
          value={amount} onChangeText={(t) => setAmount(t.replace(/\D/g, ''))} keyboardType="numeric"
          placeholder="Сумма, ₽" style={{ marginBottom: 14 }} onSubmitEditing={submitDeposit}
        />
        <NeuButton title={value > 0 ? `Пополнить на ${formatRub(value)}` : 'Пополнить'} onPress={submitDeposit} disabled={value <= 0} full />
      </BottomSheet>

      <BottomSheet visible={newOpen} onClose={() => setNewOpen(false)}>
        {title('Новая цель')}
        {sub('Назовите цель и укажите сумму')}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {EMOJIS.map((e) => (
            <Pressable key={e} onPress={() => setEmoji(e)}>
              <View style={{ width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: emoji === e ? shadows.inset : shadows.raisedS }}>
                <Text style={{ fontSize: 19 }}>{e}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Field value={name} onChangeText={setName} placeholder="Название" style={{ marginBottom: 14 }} />
        <Field
          value={target} onChangeText={(t) => setTarget(t.replace(/\D/g, ''))} keyboardType="numeric"
          placeholder="Сколько нужно, ₽" style={{ marginBottom: 14 }} onSubmitEditing={submitNew}
        />
        <NeuButton title="Создать цель" onPress={submitNew} disabled={!name.trim() || digits(target) <= 0} full />
      </BottomSheet>
    </>
  );
}
