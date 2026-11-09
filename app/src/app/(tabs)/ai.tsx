import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { SelChip } from '../../screens/shared/ui';
import { FadeInUp, Icon, NeuButton, NeuCard, Screen, SuccessOverlay, formatRub, tap, useToast } from '../../components';
import { fontFamily, useTheme } from '../../theme';
import { useBudgetStore } from '../../store';
import { parseQuickInput, type ParsedItem } from '../../logic/budget';

const SAMPLES = ['кофе 250, такси 480', 'продукты 1850', 'аптека 640, кино 700', 'подписка 399'];

export default function AiScreen() {
  const { colors, shadows } = useTheme();
  const toast = useToast();
  const { categories, accounts, lastAccountId, addTransaction } = useBudgetStore();
  const active = accounts.filter((a) => !a.archived);
  const [accSel, setAccSel] = useState<string | null>(null);
  const accountId = active.find((a) => a.id === accSel)?.id ?? active.find((a) => a.id === lastAccountId)?.id ?? active[0]?.id;
  const [text, setText] = useState('');
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [picking, setPicking] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [recent, setRecent] = useState<string[]>(SAMPLES);
  const catOf = (id: string) => categories.find((c) => c.id === id);

  const parse = () => {
    tap();
    const r = parseQuickInput(text);
    setItems(r); setPicking(null); setDone(false);
    if (!r.length) toast.show('Не удалось разобрать. Пример: кофе 250');
  };
  const addAll = () => {
    if (done) return;
    setDone(true);
  };
  const commitAll = () => {
    items.forEach((it) => addTransaction({ kind: 'expense', amount: it.amount, categoryId: it.categoryId, note: it.note, accountId }));
    const phrase = text.trim();
    if (phrase) setRecent((r) => [phrase, ...r.filter((x) => x !== phrase)].slice(0, 6));
    toast.show(`Добавлено операций: ${items.length}`);
    setItems([]); setText(''); setDone(false);
  };
  const total = items.reduce((a, i) => a + i.amount, 0);

  return (
    <Screen>
      <FadeInUp index={0}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 30, letterSpacing: -0.5, color: colors.navy }}>✨ Быстрый ввод</Text>
        <Text style={{ fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18, color: colors.text2, marginTop: 4 }}>Напишите траты через запятую, остальное сделаем сами.</Text>
      </FadeInUp>
      <FadeInUp index={1}>
        <NeuCard>
          <TextInput
            value={text} onChangeText={setText} multiline placeholder="кофе 250, такси 480" placeholderTextColor={colors.text2}
            style={{ minHeight: 84, textAlignVertical: 'top', fontFamily: fontFamily.semibold, fontSize: 16, color: colors.navy, padding: 14, borderRadius: 20, backgroundColor: colors.bg, boxShadow: shadows.inset }}
          />
          <NeuButton title="Разобрать" onPress={parse} disabled={!text.trim()} full style={{ marginTop: 14 }} />
        </NeuCard>
      </FadeInUp>
      {active.length > 1 && (
        <FadeInUp index={1}>
          <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.text2, marginBottom: 8 }}>Списать со счёта</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {active.map((a) => <SelChip key={a.id} label={`${a.icon} ${a.name}`} active={a.id === accountId} onPress={() => setAccSel(a.id)} />)}
          </View>
        </FadeInUp>
      )}
      {items.length > 0 && (
        <Animated.View entering={FadeInDown.springify().damping(20)} layout={LinearTransition.springify().damping(20)}>
          <NeuCard>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {items.map((it, i) => {
                const c = catOf(it.categoryId);
                return (
                  <Animated.View key={i} entering={ZoomIn.delay(i * 90).springify().damping(20)} layout={LinearTransition.springify().damping(20)}>
                    <Pressable onPress={() => { tap(); setPicking(picking === i ? null : i); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingLeft: 10, paddingRight: 13, borderRadius: 99, backgroundColor: colors.bg, boxShadow: picking === i ? shadows.inset : shadows.raisedS }}>
                      <Icon name={c?.icon ?? 'tag'} size={15} color={c?.color ?? colors.text2} />
                      <Text style={{ fontFamily: fontFamily.bold, fontSize: 13, color: colors.navy }}>{it.note} · {formatRub(it.amount)}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
            {picking !== null && (
              <Animated.View entering={FadeIn} style={{ marginTop: 14, gap: 8 }}>
                <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: colors.text2 }}>Категория для «{items[picking]?.note}»</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map((c) => {
                    const on = items[picking]?.categoryId === c.id;
                    return (
                      <Pressable key={c.id} onPress={() => { tap(); setItems((l) => l.map((x, j) => (j === picking ? { ...x, categoryId: c.id } : x))); setPicking(null); }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 99, backgroundColor: colors.bg, boxShadow: on ? shadows.inset : shadows.raisedS }}>
                        <Icon name={c.icon} size={14} color={on ? c.color : colors.text2} />
                        <Text style={{ fontFamily: fontFamily.bold, fontSize: 12, color: on ? colors.navy : colors.text2 }}>{c.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 12 }}>
              <Text style={{ fontFamily: fontFamily.bold, fontSize: 13, color: colors.text2 }}>Итого</Text>
              <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 15, color: colors.navy }}>{formatRub(total)}</Text>
            </View>
            <NeuButton title="Добавить все" onPress={addAll} disabled={!accountId} full />
            <SuccessOverlay visible={done} onDone={commitAll} radius={28} />
          </NeuCard>
        </Animated.View>
      )}
      <FadeInUp index={2}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 17, color: colors.navy, marginBottom: 10 }}>Недавние фразы</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {recent.map((p) => (
            <Pressable key={p} onPress={() => { tap(); setText(p); }}
              style={{ paddingVertical: 8, paddingHorizontal: 13, borderRadius: 99, backgroundColor: colors.bg, boxShadow: shadows.inset }}>
              <Text style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.navy }}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </FadeInUp>
    </Screen>
  );
}
