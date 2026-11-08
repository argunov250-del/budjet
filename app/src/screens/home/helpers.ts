import { useEffect, useState } from 'react';
import { addDays, dayKey, startOfDay } from '../../logic/budget';
import type { Transaction } from '../../store/types';

/** Current time, refreshed every 30s and whenever `dep` changes (e.g. transactions edited). */
export function useNow(dep?: unknown): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    setNow(new Date());
  }, [dep]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const MONTHS_NOM = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (d: Date) => `${d.getHours()}:${pad(d.getMinutes())}`;

export function dateLine(now: Date) {
  const w = WEEKDAYS[now.getDay()];
  return `${w[0].toUpperCase()}${w.slice(1)}, ${now.getDate()} ${MONTHS_GEN[now.getMonth()]}`;
}

export function greeting(now: Date) {
  const h = now.getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

export function opDateLabel(iso: string, now: Date) {
  const d = new Date(iso);
  const t0 = startOfDay(now);
  if (d >= t0) return `сегодня, ${hhmm(d)}`;
  if (d >= addDays(t0, -1)) return 'вчера';
  return `${WEEKDAYS[d.getDay()]}, ${hhmm(d)}`;
}

export type Suggestion = { note: string; amount: number; categoryId: string; date: string };
export type FillInfo = { yesterdayLabel: string; recorded: number; total: number; missing: Suggestion[] };

/**
 * Recurring transactions = same note on >=2 different days in the last 14 days (today included).
 * Missing = recurring ones with no record yesterday; suggested amount/category/time come from the latest earlier occurrence.
 */
export function fillSuggestions(txs: Transaction[], now: Date): FillInfo | null {
  const today = startOfDay(now);
  const y = addDays(today, -1);
  if (y.getMonth() !== today.getMonth()) return null;
  const winStart = addDays(today, -14);
  const groups = new Map<string, { days: Set<string>; last?: Transaction; onY: boolean }>();
  for (const t of txs) {
    const d = new Date(t.date);
    if (d < winStart) continue;
    const key = t.note.trim().toLowerCase();
    if (!key) continue;
    const g = groups.get(key) ?? { days: new Set<string>(), onY: false };
    g.days.add(dayKey(d));
    if (d < today) {
      if (!g.last || d > new Date(g.last.date)) g.last = t;
      if (dayKey(d) === dayKey(y)) g.onY = true;
    }
    groups.set(key, g);
  }
  let total = 0, recorded = 0;
  const missing: Suggestion[] = [];
  groups.forEach((g) => {
    if (g.days.size < 2 || !g.last) return;
    total++;
    if (g.onY) { recorded++; return; }
    const lt = new Date(g.last.date);
    const date = new Date(y.getFullYear(), y.getMonth(), y.getDate(), lt.getHours(), lt.getMinutes());
    missing.push({ note: g.last.note, amount: g.last.amount, categoryId: g.last.categoryId, date: date.toISOString() });
  });
  if (!missing.length) return null;
  const yl = WEEKDAYS[y.getDay()];
  const label = { вс: 'в воскресенье', пн: 'в понедельник', вт: 'во вторник', ср: 'в среду', чт: 'в четверг', пт: 'в пятницу', сб: 'в субботу' }[yl] ?? 'вчера';
  return { yesterdayLabel: label, recorded, total, missing };
}
