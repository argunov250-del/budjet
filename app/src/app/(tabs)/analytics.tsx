import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chip, FadeInUp, Icon, NeuButton, NeuCard, ProgressBar, Screen, formatNumber, formatRub, useToast } from '../../components';
import { addDays, daysInMonth, monthBudget, startOfDay } from '../../logic/budget';
import { Bars, type BarItem } from '../../screens/analytics/Bars';
import { Donut } from '../../screens/analytics/Donut';
import { Field, digits } from '../../screens/goals/Field';
import { useBudgetStore } from '../../store';
import { fontFamily, useTheme } from '../../theme';

const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const sum = (a: { amount: number }[]) => a.reduce((s, t) => s + t.amount, 0);

export default function AnalyticsScreen() {
  const { colors, shadows } = useTheme();
  const toast = useToast();
  const txs = useBudgetStore((s) => s.transactions);
  const categories = useBudgetStore((s) => s.categories);
  const settings = useBudgetStore((s) => s.settings);
  const updateSettings = useBudgetStore((s) => s.updateSettings);
  const now = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<'days' | 'weeks'>('days');
  const [selected, setSelected] = useState<string | null>(null);
  const [income, setIncome] = useState(String(settings.monthlyIncome));
  const [payday, setPayday] = useState(String(settings.payday));

  const d = useMemo(() => {
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate(), n = daysInMonth(now);
    const inMonth = (t: { date: string }, yy: number, mm: number) => { const x = new Date(t.date); return x.getFullYear() === yy && x.getMonth() === mm; };
    const cur = txs.filter((t) => inMonth(t, y, m));
    const prevDate = new Date(y, m - 1, 1);
    const prev = txs.filter((t) => inMonth(t, prevDate.getFullYear(), prevDate.getMonth()));
    const prevSame = prev.filter((t) => new Date(t.date).getDate() <= today);
    const total = sum(cur);
    const prevTotal = sum(prevSame);
    const slices = categories
      .map((c) => ({ id: c.id, label: c.name, color: c.color, value: sum(cur.filter((t) => t.categoryId === c.id)) }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const dayBars: BarItem[] = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(startOfDay(now), i - 6);
      const v = sum(txs.filter((t) => startOfDay(new Date(t.date)).getTime() === day.getTime()));
      return { label: i === 6 ? 'сег' : WD[day.getDay()], value: v, hot: i === 6 };
    });
    const weekBars: BarItem[] = [[1, 7], [8, 14], [15, 21], [22, n]].map(([a, b], i) => ({
      label: `${a}–${b}`, hot: today >= a && today <= b,
      value: sum(cur.filter((t) => { const x = new Date(t.date).getDate(); return x >= a && x <= b; })),
    })).filter((_, i) => i < 4);
    const groups = new Map<string, { name: string; total: number; count: number }>();
    cur.forEach((t) => {
      const k = t.note.trim().toLowerCase();
      const g = groups.get(k) ?? { name: t.note.trim(), total: 0, count: 0 };
      g.total += t.amount; g.count += 1; groups.set(k, g);
    });
    const top = [...groups.values()].sort((a, b) => b.total - a.total).slice(0, 3);
    const forecast = (total / Math.max(1, today)) * n;
    return { total, prevTotal, hasPrev: prev.length > 0, slices, dayBars, weekBars, top, forecast, today, n };
  }, [txs, categories, now]);

  const budget = monthBudget(settings);
  const delta = d.prevTotal > 0 ? Math.round(((d.total - d.prevTotal) / d.prevTotal) * 100) : 0;
  const over = d.forecast - budget;

  const saveSettings = () => {
    const inc = digits(income), pd = digits(payday);
    if (inc <= 0 || pd < 1 || pd > 31) { toast.show('Проверьте доход и день зарплаты'); return; }
    updateSettings({ monthlyIncome: inc, payday: pd });
    toast.show('Настройки сохранены');
  };

  const sec = (t: string, small?: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, marginHorizontal: 4, marginBottom: -4 }}>
      <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 17, color: colors.navy }}>{t}</Text>
      {small ? <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{small}</Text> : null}
    </View>
  );

  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy }}>Аналитика</Text>
      </View>

      <FadeInUp index={0}>
        <NeuCard>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }}>Потрачено в этом месяце</Text>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 32, letterSpacing: -1, color: colors.navy, fontVariant: ['tabular-nums'], marginVertical: 6 }}>{formatRub(d.total)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {d.hasPrev ? (
              <Chip
                label={`${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta)}% к прошлому`}
                icon={<Icon name="bars" size={15} color={delta > 0 ? colors.accent : colors.ok} />}
              />
            ) : (
              <Chip label="Нет данных за прошлый месяц" icon={<Icon name="calendar" size={15} color={colors.text2} />} />
            )}
            {d.hasPrev && <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>было {formatRub(d.prevTotal)}</Text>}
          </View>
        </NeuCard>
      </FadeInUp>

      {sec('По категориям', 'нажмите на категорию')}
      <FadeInUp index={1}>
        <NeuCard>
          <Donut slices={d.slices} selectedId={selected} total={d.total} />
          <View style={{ marginTop: 14 }}>
            {d.slices.map((s, i) => {
              const on = selected === s.id;
              return (
                <Pressable key={s.id} onPress={() => setSelected(on ? null : s.id)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider, opacity: selected && !on ? 0.5 : 1 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 5, backgroundColor: s.color }} />
                    <Text style={{ flex: 1, fontFamily: on ? fontFamily.extrabold : fontFamily.bold, fontSize: 14, color: colors.navy }}>{s.label}</Text>
                    <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.navy, fontVariant: ['tabular-nums'] }}>{formatRub(s.value)}</Text>
                    <Text style={{ width: 38, textAlign: 'right', fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>{Math.round((s.value / (d.total || 1)) * 100)}%</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </NeuCard>
      </FadeInUp>

      {sec('Динамика')}
      <FadeInUp index={2}>
        <NeuCard>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {(['days', 'weeks'] as const).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)}>
                <View style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99, backgroundColor: colors.bg, boxShadow: mode === m ? shadows.inset : shadows.raisedS }}>
                  <Text style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: mode === m ? colors.accent : colors.text2 }}>{m === 'days' ? 'Дни' : 'Недели'}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <Bars key={mode} items={mode === 'days' ? d.dayBars : d.weekBars} />
        </NeuCard>
      </FadeInUp>

      {sec('Куда утекают деньги', 'топ-3 за месяц')}
      <FadeInUp index={3}>
        <NeuCard>
          {d.top.length === 0 && <Text style={{ fontFamily: fontFamily.semibold, fontSize: 13, color: colors.text2 }}>Пока нет трат</Text>}
          {d.top.map((t, i) => (
            <View key={t.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider }}>
              <View style={{ width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.raisedS }}>
                <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 15, color: colors.accent }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.navy }}>{t.name}</Text>
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>×{t.count} · {Math.round((t.total / (d.total || 1)) * 100)}% трат</Text>
              </View>
              <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14.5, color: colors.navy, fontVariant: ['tabular-nums'] }}>{formatRub(t.total)}</Text>
            </View>
          ))}
        </NeuCard>
      </FadeInUp>

      {sec('Прогноз на месяц', `день ${d.today} из ${d.n}`)}
      <FadeInUp index={4}>
        <NeuCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12.5, color: colors.text2 }}>К концу месяца потратите</Text>
              <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 26, letterSpacing: -0.5, color: over > 0 ? colors.accent : colors.navy, fontVariant: ['tabular-nums'] }}>≈ {formatRub(d.forecast)}</Text>
            </View>
            <Chip
              label={over > 0 ? `перерасход ${formatNumber(over)} ₽` : `запас ${formatNumber(-over)} ₽`}
              icon={<Icon name={over > 0 ? 'sparkles' : 'check'} size={15} color={over > 0 ? colors.accent : colors.ok} />}
            />
          </View>
          <ProgressBar value={budget > 0 ? d.forecast / budget : 0} />
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2, marginTop: 8 }}>Бюджет на месяц {formatRub(budget)}</Text>
        </NeuCard>
      </FadeInUp>

      {sec('Настройки')}
      <FadeInUp index={5}>
        <NeuCard>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12.5, color: colors.text2, marginBottom: 6 }}>Доход в месяц, ₽</Text>
          <Field value={income} onChangeText={(t) => setIncome(t.replace(/\D/g, ''))} keyboardType="numeric" style={{ marginBottom: 14 }} />
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12.5, color: colors.text2, marginBottom: 6 }}>День зарплаты (1–31)</Text>
          <Field value={payday} onChangeText={(t) => setPayday(t.replace(/\D/g, '').slice(0, 2))} keyboardType="numeric" style={{ marginBottom: 14 }} />
          <NeuButton title="Сохранить" onPress={saveSettings} full />
        </NeuCard>
      </FadeInUp>
    </Screen>
  );
}
