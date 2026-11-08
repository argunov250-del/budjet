import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { BottomSheet, Icon, NeuButton, formatNumber, success, tap } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import type { Category } from '../../store';
import { TextInput } from 'react-native';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const SPRING = { damping: 14, stiffness: 240, mass: 0.7 };

function Key({ k, onPress }: { k: string; onPress: (k: string) => void }) {
  const { colors, shadows } = useTheme();
  const s = useSharedValue(1);
  const [down, setDown] = useState(false);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  if (!k) return <View style={{ width: '31%', height: 52 }} />;
  return (
    <Pressable
      style={{ width: '31%' }}
      onPressIn={() => { setDown(true); s.value = withSpring(0.94, SPRING); tap(); }}
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

type Props = {
  visible: boolean; onClose: () => void; categories: Category[];
  onSubmit: (v: { amount: number; categoryId: string; note: string; date: Date }) => void;
};

export function AddSheet({ visible, onClose, categories, onSubmit }: Props) {
  const { colors, shadows } = useTheme();
  const [digits, setDigits] = useState('');
  const [cat, setCat] = useState(categories[0]?.id ?? 'other');
  const [note, setNote] = useState('');
  const [yesterday, setYesterday] = useState(false);
  const pop = useSharedValue(1);
  const popSt = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  useEffect(() => { if (visible) { setDigits(''); setNote(''); setYesterday(false); } }, [visible]);

  const press = (k: string) => {
    setDigits((d) => (k === '⌫' ? d.slice(0, -1) : d.length >= 7 ? d : (d + k).replace(/^0+/, '')));
    pop.value = withSequence(withSpring(1.06, SPRING), withSpring(1, SPRING));
  };
  const amount = Number(digits || 0);
  const submit = () => {
    if (!amount) return;
    success();
    const d = new Date();
    if (yesterday) d.setDate(d.getDate() - 1);
    onSubmit({ amount, categoryId: cat, note: note.trim(), date: d });
  };
  const chip = (label: string, active: boolean, on: () => void) => (
    <Pressable onPress={() => { tap(); on(); }} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, backgroundColor: colors.bg, boxShadow: active ? shadows.inset : shadows.raisedS }}>
      <Text style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: active ? colors.navy : colors.text2 }}>{label}</Text>
    </Pressable>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ gap: 14 }}>
        <Animated.Text style={[{ fontFamily: fontFamily.extrabold, fontSize: 40, letterSpacing: -1, textAlign: 'center', color: amount ? colors.navy : colors.text2, fontVariant: ['tabular-nums'] }, popSt]}>
          {formatNumber(amount)} ₽
        </Animated.Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {categories.map((c) => <CatTile key={c.id} c={c} active={c.id === cat} onPress={() => setCat(c.id)} />)}
        </View>
        <TextInput
          value={note} onChangeText={setNote} placeholder="Заметка" placeholderTextColor={colors.text2}
          style={{ fontFamily: fontFamily.semibold, fontSize: 16, color: colors.navy, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.bg, boxShadow: shadows.inset }}
        />
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="calendar" size={18} color={colors.text2} />
          {chip('Сегодня', !yesterday, () => setYesterday(false))}
          {chip('Вчера', yesterday, () => setYesterday(true))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          {KEYS.map((k, i) => <Key key={i} k={k} onPress={press} />)}
        </View>
        <NeuButton title="Добавить" onPress={submit} disabled={!amount} full />
      </View>
    </BottomSheet>
  );
}
