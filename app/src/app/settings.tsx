import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import { BottomSheet, FadeInUp, NeuButton, NeuCard, Screen, formatRub, success, tap, useToast } from '../components';
import { accountBalance } from '../logic/budget';
import { Field, digits } from '../screens/goals/Field';
import { PressScale, SelChip } from '../screens/shared/ui';
import {
  ACCOUNT_COLORS, ACCOUNT_TYPES, exportJson, parseImport, useBudgetStore, type Account, type AccountType, type ThemePref,
} from '../store';
import { fontFamily, useTheme } from '../theme';

const signed = (s: string) => ((s.trim().startsWith('-') || s.trim().startsWith('−')) ? -1 : 1) * digits(s);
const THEMES: { key: ThemePref; label: string }[] = [
  { key: 'system', label: 'Как в системе' }, { key: 'light', label: 'Светлая' }, { key: 'dark', label: 'Тёмная' },
];

export default function SettingsScreen() {
  const { colors, shadows } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const st = useBudgetStore();
  const { accounts, transactions, categories, settings } = st;

  const [budget, setBudget] = useState(settings.monthlyBudget ? String(settings.monthlyBudget) : '');
  const [income, setIncome] = useState(settings.monthlyIncome ? String(settings.monthlyIncome) : '');
  const [payday, setPayday] = useState(String(settings.payday));
  const [limits, setLimits] = useState<Record<string, string>>({});

  // account sheet: undefined = closed, null = new, Account = edit
  const [editing, setEditing] = useState<Account | null | undefined>(undefined);
  const [aName, setAName] = useState('');
  const [aType, setAType] = useState<AccountType>('card');
  const [aBal, setABal] = useState('');
  const [aColor, setAColor] = useState(ACCOUNT_COLORS[0]);
  const [dataOpen, setDataOpen] = useState(false);
  const [json, setJson] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (editing === undefined) return;
    setAName(editing?.name ?? ''); setAType(editing?.type ?? 'card');
    setABal(editing ? String(editing.initialBalance) : ''); setAColor(editing?.color ?? ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length]);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = () => { tap(); if (router.canGoBack()) router.back(); else router.replace('/'); };
  const activeCount = accounts.filter((a) => !a.archived).length;

  const saveBudget = () => {
    st.updateSettings({ monthlyBudget: digits(budget), monthlyIncome: digits(income), payday: Math.min(31, Math.max(1, digits(payday) || 1)) });
    success(); toast.show('Бюджет сохранён');
  };
  const saveAccount = () => {
    if (!aName.trim()) return;
    const icon = ACCOUNT_TYPES.find((t) => t.type === aType)?.icon;
    if (editing) st.updateAccount(editing.id, { name: aName.trim(), type: aType, initialBalance: signed(aBal), color: aColor, icon });
    else st.addAccount({ name: aName, type: aType, initialBalance: signed(aBal), color: aColor });
    success(); setEditing(undefined);
  };
  const doExport = () => {
    const text = exportJson(st);
    setJson(text);
    Share.share({ message: text }).catch(() => {});
  };
  const doImport = () => {
    const d = parseImport(json);
    if (!d) { toast.show('Не удалось прочитать данные'); return; }
    st.replaceData(d); success(); setDataOpen(false); toast.show('Данные импортированы');
  };
  const doReset = () => { setResetOpen(false); st.reset(); }; // root guard returns to onboarding

  const title = (t: string) => <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 17, color: colors.navy, marginHorizontal: 4 }}>{t}</Text>;
  const label = (t: string) => <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.text2, marginBottom: 6, marginTop: 12 }}>{t}</Text>;

  return (
    <>
      <Screen style={{ paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <PressScale onPress={back} label="Назад" style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: shadows.raisedS }}>
            <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 22, color: colors.navy, marginTop: -2 }}>‹</Text>
          </PressScale>
          <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy }}>Настройки</Text>
        </View>

        <FadeInUp index={0}>
          <View style={{ gap: 10 }}>
            {title('Счета')}
            <NeuCard padding={8}>
              {accounts.length === 0 && <Text style={{ padding: 14, fontFamily: fontFamily.semibold, color: colors.text2 }}>Счетов пока нет</Text>}
              {accounts.map((a, i) => (
                <PressScale key={a.id} onPress={() => { tap(); setEditing(a); }} scale={0.98}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider, opacity: a.archived ? 0.55 : 1 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.insetS }}>
                    <Text style={{ fontSize: 18 }}>{a.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.navy }}>{a.name}</Text>
                    <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>
                      {ACCOUNT_TYPES.find((t) => t.type === a.type)?.label}{a.archived ? ' · в архиве' : ''}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14.5, color: colors.navy, fontVariant: ['tabular-nums'] }}>{formatRub(accountBalance(a, transactions))}</Text>
                </PressScale>
              ))}
            </NeuCard>
            <NeuButton title="＋ Добавить счёт" variant="neu" onPress={() => setEditing(null)} />
          </View>
        </FadeInUp>

        <FadeInUp index={1}>
          <View style={{ gap: 10 }}>
            {title('Бюджет')}
            <NeuCard>
              {label('Бюджет на месяц, ₽ (пусто — доход минус обязательные)')}
              <Field value={budget} onChangeText={(t) => setBudget(t.replace(/\D/g, ''))} keyboardType="numeric" placeholder="0" />
              {label('Доход в месяц, ₽')}
              <Field value={income} onChangeText={(t) => setIncome(t.replace(/\D/g, ''))} keyboardType="numeric" placeholder="0" />
              {label('День зарплаты')}
              <Field value={payday} onChangeText={(t) => setPayday(t.replace(/\D/g, '').slice(0, 2))} keyboardType="numeric" placeholder="1" />
              <NeuButton title="Сохранить" onPress={saveBudget} full style={{ marginTop: 16 }} />
            </NeuCard>
          </View>
        </FadeInUp>

        <FadeInUp index={2}>
          <View style={{ gap: 10 }}>
            {title('Лимиты категорий')}
            <NeuCard>
              {categories.map((c, i) => (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.color }} />
                  <Text style={{ flex: 1, fontFamily: fontFamily.bold, fontSize: 14, color: colors.navy }}>{c.name}</Text>
                  <Field
                    style={{ width: 120, height: 40, paddingVertical: 0, paddingHorizontal: 14, fontSize: 14, textAlign: 'right' }}
                    value={limits[c.id] ?? (c.monthlyLimit ? String(c.monthlyLimit) : '')}
                    placeholder="без лимита" keyboardType="numeric"
                    onChangeText={(t) => setLimits((l) => ({ ...l, [c.id]: t.replace(/\D/g, '') }))}
                    onEndEditing={() => { if (limits[c.id] !== undefined) st.setCategoryLimit(c.id, digits(limits[c.id])); }}
                  />
                </View>
              ))}
            </NeuCard>
          </View>
        </FadeInUp>

        <FadeInUp index={3}>
          <View style={{ gap: 10 }}>
            {title('Тема')}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {THEMES.map((t) => <SelChip key={t.key} label={t.label} active={settings.theme === t.key} onPress={() => st.updateSettings({ theme: t.key })} />)}
            </View>
          </View>
        </FadeInUp>

        <FadeInUp index={4}>
          <View style={{ gap: 10 }}>
            {title('Данные')}
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <NeuButton title="Экспорт / импорт" variant="neu" onPress={() => { setJson(''); setDataOpen(true); }} />
              <NeuButton title="Сбросить все данные" variant="neu" textStyle={{ color: colors.accent }} onPress={() => setResetOpen(true)} />
            </View>
          </View>
        </FadeInUp>
      </Screen>

      <BottomSheet visible={editing !== undefined} onClose={() => setEditing(undefined)}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 20, color: colors.navy }}>{editing ? 'Счёт' : 'Новый счёт'}</Text>
        {label('Название')}
        <Field value={aName} onChangeText={setAName} placeholder="Например, Наличные" />
        {label('Тип')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ACCOUNT_TYPES.map((t) => <SelChip key={t.type} label={`${t.icon} ${t.label}`} active={aType === t.type} onPress={() => setAType(t.type)} />)}
        </View>
        {label('Начальный остаток, ₽')}
        <Field value={aBal} onChangeText={(t) => setABal(t.replace(/[^\d-]/g, ''))} keyboardType="numbers-and-punctuation" placeholder="0" />
        {label('Цвет')}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {ACCOUNT_COLORS.map((c) => (
            <Pressable key={c} onPress={() => { tap(); setAColor(c); }}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: aColor === c ? 3 : 0, borderColor: colors.bg, boxShadow: aColor === c ? shadows.inset : shadows.raisedS }} />
          ))}
        </View>
        <NeuButton title="Сохранить" onPress={saveAccount} disabled={!aName.trim()} full style={{ marginTop: 18 }} />
        {editing && (
          <NeuButton
            title={editing.archived ? 'Вернуть из архива' : 'Архивировать'} variant="neu" full style={{ marginTop: 10 }}
            disabled={!editing.archived && activeCount <= 1}
            onPress={() => { st.setAccountArchived(editing.id, !editing.archived); setEditing(undefined); }}
          />
        )}
        {editing && !editing.archived && activeCount <= 1 && (
          <Text style={{ fontFamily: fontFamily.medium, fontSize: 12, color: colors.text2, marginTop: 8, textAlign: 'center' }}>Нельзя архивировать единственный активный счёт</Text>
        )}
      </BottomSheet>

      <BottomSheet visible={dataOpen} onClose={() => setDataOpen(false)}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 20, color: colors.navy }}>Экспорт / импорт</Text>
        <Text style={{ fontFamily: fontFamily.medium, fontSize: 13, color: colors.text2, marginTop: 4, marginBottom: 12 }}>
          Экспорт делится JSON-текстом (его можно скопировать из поля). Для импорта вставьте JSON в поле — текущие данные будут заменены.
        </Text>
        <TextInput
          value={json} onChangeText={setJson} multiline placeholder="{ … }" placeholderTextColor={colors.text2} autoCapitalize="none" autoCorrect={false}
          style={{ minHeight: 140, maxHeight: 220, textAlignVertical: 'top', fontFamily: fontFamily.medium, fontSize: 12, color: colors.navy, padding: 14, borderRadius: 20, backgroundColor: colors.bg, boxShadow: shadows.inset }}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <NeuButton title="Экспортировать" variant="neu" onPress={doExport} />
          <View style={{ flex: 1 }}><NeuButton title="Импортировать" onPress={doImport} disabled={!json.trim()} full /></View>
        </View>
      </BottomSheet>

      <BottomSheet visible={resetOpen} onClose={() => setResetOpen(false)}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 20, color: colors.navy }}>Сбросить все данные?</Text>
        <Text style={{ fontFamily: fontFamily.medium, fontSize: 13.5, lineHeight: 19, color: colors.text2, marginTop: 6, marginBottom: 18 }}>
          Счета, операции, цели и настройки будут удалены без возможности восстановления. Сначала можно сделать экспорт.
        </Text>
        <NeuButton title="Да, удалить всё" onPress={doReset} full style={{ backgroundColor: colors.accent }} textStyle={{ color: '#fff' }} />
        <NeuButton title="Отмена" variant="neu" onPress={() => setResetOpen(false)} full style={{ marginTop: 10 }} />
      </BottomSheet>
    </>
  );
}
