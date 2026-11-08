import { Text, View } from 'react-native';
import { AnimatedNumber, Icon, NeuCard, PaceChart, Ring } from '../../components';
import type { DailyLimit, MonthSeries } from '../../logic/budget';
import { fontFamily, useTheme } from '../../theme';
import { hhmm } from './helpers';

function Row({ label, value, pos }: { label: string; value: number; pos?: boolean }) {
  const { colors } = useTheme();
  const sign = value > 0 ? '+' : '';
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.divider }}>
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12.5, color: colors.text2 }}>{label}</Text>
      <AnimatedNumber value={value} duration={1100} prefix={sign}
        style={{ fontFamily: fontFamily.extrabold, fontSize: 12.5, color: pos ? colors.accent : colors.navy }} />
    </View>
  );
}

export function MainCard({ dl, series, now }: { dl: DailyLimit; series: MonthSeries; now: Date }) {
  const { colors, shadows } = useTheme();
  const left = Math.max(0, dl.leftToday);
  const progress = dl.limit > 0 ? Math.min(1, left / dl.limit) : 0;
  const over = dl.leftToday < 0;
  const mode = over ? 'Перерасход' : dl.savedYesterday > 0 ? 'Экономный день' : 'Обычный день';
  const under = series.diff >= 0;
  return (
    <NeuCard pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingLeft: 9, paddingRight: 12, borderRadius: 99, backgroundColor: colors.bg, boxShadow: shadows.inset }}>
          <Icon name="sun" size={16} color={colors.accent} strokeWidth={2.2} />
          <Text style={{ fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.navy }}>{mode}</Text>
        </View>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>Пересчитано {hhmm(now)}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ring progress={progress} size={158}>
          <AnimatedNumber value={left} style={{ fontFamily: fontFamily.extrabold, fontSize: 32, letterSpacing: -1, lineHeight: 34, color: colors.navy }} />
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2, marginTop: 4 }}>₽ на сегодня</Text>
        </Ring>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>Лимит на сегодня</Text>
          <AnimatedNumber value={dl.limit} style={{ fontFamily: fontFamily.extrabold, fontSize: 26, letterSpacing: -0.5, color: colors.navy, marginBottom: 6 }} />
          <Row label="База" value={dl.base} />
          <Row label={dl.savedYesterday < 0 ? 'Перерасход вчера' : 'Сэкономил вчера'} value={dl.savedYesterday} pos={dl.savedYesterday > 0} />
        </View>
      </View>
      <View style={{ height: 1, marginTop: 16, marginBottom: 14, backgroundColor: colors.shDark, opacity: 0.5 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 15, color: colors.navy }}>Траты vs темп</Text>
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: 12, color: colors.text2 }}>
          {under ? 'В темпе · ' : 'Быстрее темпа · '}
          <Text style={{ fontFamily: fontFamily.extrabold, color: colors.accent }}>
            на {Math.round(Math.abs(series.diff)).toLocaleString('ru-RU').replace(/[\s ]/g, ' ')} ₽ {under ? 'меньше' : 'больше'}
          </Text>
        </Text>
      </View>
      <PaceChart series={series} />
    </NeuCard>
  );
}
