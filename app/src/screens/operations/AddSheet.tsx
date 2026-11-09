import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { BottomSheet, Icon, NeuButton, SuccessOverlay, formatNumber, tap } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import { incomeCategories, type Account, type Category, type TxKind } from '../../store';
import { Segmented, SelChip } from '../shared/ui';
import { TextInput } from 'react-native';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const SPRING = { damping: 20, stiffness: 140, mass: 0.7 };

function Key({ k, onPress }: { k: string; onPress: (k: string) => void }) {
  const { colors, shadows } = useTheme();
  const s = useSharedValue(1);
  const [down, setDown] = useState(false);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  if (!k) return <View style={{ width: '31%', height: 52 }} />;
  return (
    <Pressable
      style={{ width: '31%' }}
      onPressIn={() => { setDown(true); s.value = withSpring(0.97, SPRING); tap(); }}
      onPressOut={() => { setDown(false); s.value = withSpring(1, SPRING); }}
      onPress={() => onPress(k)}
    >
      <Animated.View style={[{ height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, boxShadow: down ? shadows.insetS : shadows.raisedS }, st]}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 22, color: colors.navy }}>{k}</Text>
      </Animated.View>
    </Pressable>
  );
}

function CatTile({ c, active, onPress }: { c: Category; active: boolean; onPress: () => void }) {
  const { colors, shadows } = useTheme();
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable onPress={() => { tap(); s.value = withSequence(withSpring(0.92, SPRING), withSpring(1, SPRING)); onPress(); }}>
      <Animated.View style={[{ width: 74, paddingVertical: 10, borderRadius: 18, alignItems: 'center', gap: 4, backgroundColor: colors.bg, boxShadow: active ? shadows.inset : shadows.raisedS }, st]}>
        <Icon name={c.icon} size={20} color={active ? c.color : colors.text2} />
        <Text numberOfLines={1} style={{ fontFamily: fontFamily.bold, fontSize: 11, color: active ? colors.navy : colors.text2 }}>{c.name}</Text>
      </Animated.View>
    </Pressable>
  );
}

export type AddSubmit = {
  kind: TxKind; amount: number; categoryId: string; note: string; date: Date; accountId: string; toAccountId?: string;
};

type Props = {
  visible: boolean; onClose: () => void;
  /** expense categories */
  categories: Category[];
  accounts: Account[];
  defaultAccountId?: string | null;
  onSubmit: (v: AddSubmit) => void;
};

const KINDS: { key: TxKind; label: string }[] = [
  { key: 'expense', label: 'Расход' },
  { key: 'income', label: 'Доход' },
  { key: 'transfer', label: 'Перевод' },
];

export function AddSheet({ visible, onClose, categories, accounts, defaultAccountId, onSubmit }: Props) {
  const { colors, shadows } = useTheme();
  const active = accounts.filter((a) => !a.archived);
  const [kind, setKind] = useState<TxKind>('expense');
  const [digits, setDigits] = useState('');
  const [cat, setCat] = useState(categories[0]?.id ?? 'other');
  const [incCat, setIncCat] = useState(incomeCategories[0].id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [yesterday, setYesterday] = useState(false);
  const [ok, setOk] = useState(false);
  const pop = useSharedValue(1);
  const popSt = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  useEffect(() => {
    if (!visible) return;
    setOk(false); setDigits(''); setNote(''); setYesterday(false); setKind('expense');
    const f = active.find((a) => a.id === defaultAccountId) ?? active[0];
    setFrom(f?.id ?? '');
    setTo(active.find((a) => a.id !== f?.id)?.id ?? '');
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (k: string) => {
    setDigits((d) => (k === '⌫' ? d.slice(0, -1) : d.length >= 9 ? d : (d + k).replace(/^0+/, '')));
    pop.value = withSequence(withSpring(1.06, SPRING), withSpring(1, SPRING));
  };
  const amount = Number(digits || 0);
  const canTransfer = active.length >= 2 && !!to && to !== from;
  const valid = amount > 0 && !!from && (kind !== 'transfer' || canTransfer);
  const submit = () => {
    if (!valid || ok) return;
    setOk(true);
  };
  const commit = () => {
    const d = new Date();
    if (yesterday) d.setDate(d.getDate() - 1);
    onSubmit({
      kind, amount, note: note.trim(), date: d, accountId: from,
      categoryId: kind === 'expense' ? cat : kind === 'income' ? incCat : '',
      toAccountId: kind === 'transfer' ? to : undefined,
    });
  };
  const pickFrom = (id: string) => { setFrom(id); if (id === to) setTo(active.find((a) => a.id !== id)?.id ?? ''); };
  const cats = kind === 'income' ? incomeCategories : categories;
  const curCat = kind === 'income' ? incCat : cat;
  const sign = kind === 'income' ? '+' : kind === 'expense' && amount ? '−' : '';

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 640 }} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 14 }}>
        <Segmented items={KINDS} value={kind} onChange={setKind} />
        <Animated.Text style={[{ fontFamily: fontFamily.extrabold, fontSize: 40, letterSpacing: -1, textAlign: 'center', color: amount ? (kind === 'income' ? colors.ok : colors.navy) : colors.text2, fontVariant: ['tabular-nums'] }, popSt]}>
          {sign}{formatNumber(amount)} ₽
        </Animated.Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.text2 }}>{kind === 'transfer' ? 'Со счёта' : 'Счёт'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {active.map((a) => <SelChip key={a.id} label={`${a.icon} ${a.name}`} active={a.id === from} onPress={() => pickFrom(a.id)} />)}
          </View>
        </View>
        {kind === 'transfer' ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.text2 }}>На счёт</Text>
            {active.length < 2 ? (
              <Text style={{ fontFamily: fontFamily.medium, fontSize: 13, color: colors.text2 }}>Для перевода нужно минимум два счёта — добавьте второй в настройках.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {active.filter((a) => a.id !== from).map((a) => <SelChip key={a.id} label={`${a.icon} ${a.name}`} active={a.id === to} onPress={() => setTo(a.id)} />)}
              </View>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {cats.map((c) => <CatTile key={c.id} c={c} active={c.id === curCat} onPress={() => (kind === 'income' ? setIncCat(c.id) : setCat(c.id))} />)}
          </View>
        )}
        <TextInput
          value={note} onChangeText={setNote} placeholder="Заметка" placeholderTextColor={colors.text2}
          style={{ fontFamily: fontFamily.semibold, fontSize: 16, color: colors.navy, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.bg, boxShadow: shadows.inset }}
        />
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="calendar" size={18} color={colors.text2} />
          <SelChip label="Сегодня" active={!yesterday} onPress={() => setYesterday(false)} />
          <SelChip label="Вчера" active={yesterday} onPress={() => setYesterday(true)} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          {KEYS.map((k, i) => <Key key={i} k={k} onPress={press} />)}
        </View>
        <NeuButton title="Добавить" onPress={submit} disabled={!valid} full />
      </View>
      </ScrollView>
      <SuccessOverlay visible={ok} onDone={commit} radius={32} />
    </BottomSheet>
  );
}
