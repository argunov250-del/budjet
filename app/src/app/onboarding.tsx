import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, ZoomIn } from 'react-native-reanimated';
import { FadeInUp, NeuButton, NeuCard, Screen, success } from '../components';
import { Field, digits } from '../screens/goals/Field';
import { SelChip } from '../screens/shared/ui';
import { ACCOUNT_TYPES, useBudgetStore, type AccountType } from '../store';
import { fontFamily, useTheme } from '../theme';

const signed = (s: string) => {
  const neg = s.trim().startsWith('-') || s.trim().startsWith('−');
  return (neg ? -1 : 1) * digits(s);
};

export default function Onboarding() {
  const { colors, shadows } = useTheme();
  const addAccount = useBudgetStore((s) => s.addAccount);
  const updateSettings = useBudgetStore((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Основная карта');
  const [type, setType] = useState<AccountType>('card');
  const [balance, setBalance] = useState('');
  const [budget, setBudget] = useState('');
  const [income, setIncome] = useState('');
  const [payday, setPayday] = useState('1');

  const next = () => setStep((s) => s + 1);
  const finish = () => {
    // creating the account flips the root guard and moves to the tabs
    updateSettings({
      monthlyIncome: digits(income),
      monthlyBudget: digits(budget),
      payday: Math.min(31, Math.max(1, digits(payday) || 1)),
    });
    success();
    addAccount({ name, type, initialBalance: signed(balance) });
  };

  const dots = (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: i === step ? 26 : 8, height: 8, borderRadius: 4, backgroundColor: i <= step ? colors.accent : colors.track, boxShadow: shadows.insetS }} />
      ))}
    </View>
  );
  const h1 = (t: string) => <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 28, letterSpacing: -0.5, color: colors.navy }}>{t}</Text>;
  const p = (t: string) => <Text style={{ fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20, color: colors.text2, marginTop: 6 }}>{t}</Text>;
  const label = (t: string) => <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.text2, marginBottom: 6, marginTop: 14 }}>{t}</Text>;

  return (
    <Screen>
      <FadeInUp index={0}><View style={{ paddingTop: 24 }}>{dots}</View></FadeInUp>
      {step === 0 && (
        <Animated.View key="s0" entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(180)}>
          <NeuCard>
            {h1('Добро пожаловать в Ровно')}
            {p('Начнём со счёта, на котором вы держите деньги.')}
            {label('Название')}
            <Field value={name} onChangeText={setName} placeholder="Например, Основная карта" />
            {label('Тип')}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {ACCOUNT_TYPES.map((t) => <SelChip key={t.type} label={`${t.icon} ${t.label}`} active={type === t.type} onPress={() => setType(t.type)} />)}
            </View>
            {label('Сколько сейчас на счёте, ₽')}
            <Field value={balance} onChangeText={(t) => setBalance(t.replace(/[^\d-]/g, ''))} keyboardType="numbers-and-punctuation" placeholder="0" />
            <NeuButton title="Дальше" onPress={next} disabled={!name.trim()} full style={{ marginTop: 20 }} />
          </NeuCard>
        </Animated.View>
      )}
      {step === 1 && (
        <Animated.View key="s1" entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(180)}>
          <NeuCard>
            {h1('Бюджет на месяц')}
            {p('Из него считается лимит на каждый день. Можно изменить позже в настройках.')}
            {label('Сколько можно тратить в месяц, ₽')}
            <Field value={budget} onChangeText={(t) => setBudget(t.replace(/\D/g, ''))} keyboardType="numeric" placeholder="Например, 55000" />
            {label('Доход в месяц, ₽ (необязательно)')}
            <Field value={income} onChangeText={(t) => setIncome(t.replace(/\D/g, ''))} keyboardType="numeric" placeholder="0" />
            {label('День зарплаты')}
            <Field value={payday} onChangeText={(t) => setPayday(t.replace(/\D/g, '').slice(0, 2))} keyboardType="numeric" placeholder="1" />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <NeuButton title="Назад" variant="neu" onPress={() => setStep(0)} />
              <View style={{ flex: 1 }}><NeuButton title="Дальше" onPress={next} full /></View>
            </View>
          </NeuCard>
        </Animated.View>
      )}
      {step === 2 && (
        <Animated.View key="s2" entering={FadeInRight.springify().damping(20)} exiting={FadeOutLeft.duration(180)}>
          <NeuCard style={{ alignItems: 'center' }}>
            <Animated.View entering={ZoomIn.delay(150).springify().damping(20)}
              style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: shadows.raised }}>
              <Text style={{ fontSize: 38 }}>🎉</Text>
            </Animated.View>
            <View style={{ marginTop: 18, alignItems: 'center' }}>
              {h1('Всё готово')}
              {p('Добавляйте расходы и доходы — Ровно подскажет, сколько можно потратить сегодня.')}
            </View>
            <NeuButton title="Начать" onPress={finish} full style={{ marginTop: 22 }} />
          </NeuCard>
        </Animated.View>
      )}
    </Screen>
  );
}
