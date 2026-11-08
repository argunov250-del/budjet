import type { Category, Settings, Transaction } from '../store/types';

const DAY = 86400000;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
/** days remaining in the month INCLUDING today */
export const daysLeft = (d: Date) => daysInMonth(d) - d.getDate() + 1;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const sum = (txs: Transaction[]) => txs.reduce((a, t) => a + t.amount, 0);
const inMonth = (t: Transaction, now: Date) => {
  const d = new Date(t.date);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export function monthTransactions(txs: Transaction[], now: Date) {
  return txs.filter((t) => inMonth(t, now));
}

export function monthBudget(s: Settings) {
  return Math.max(0, s.monthlyIncome - s.fixedExpenses);
}

/** spent on the calendar day of `day` */
export function spentOnDay(txs: Transaction[], day: Date) {
  const k = dayKey(day);
  return sum(txs.filter((t) => dayKey(new Date(t.date)) === k));
}
export const spentToday = (txs: Transaction[], now: Date) => spentOnDay(txs, now);

export type DailyLimit = {
  /** today's limit = base + savedYesterday */
  limit: number;
  /** what yesterday's limit was (limit as computed at the start of the previous day; = limit on day 1) */
  base: number;
  /** carried over from yesterday: positive if yesterday under limit, negative if overspent */
  savedYesterday: number;
  monthBudget: number;
  /** month budget left at the start of today (excluding today's spend) */
  remaining: number;
  daysLeft: number;
  spentToday: number;
  leftToday: number;
};

/**
 * Daily limit = (month budget - spent before today) / days left incl. today.
 * Rounded to whole rubles. base + savedYesterday === limit always.
 */
export function dailyLimit(txs: Transaction[], settings: Settings, now: Date): DailyLimit {
  const budget = monthBudget(settings);
  const today = startOfDay(now);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const mt = monthTransactions(txs, now);
  const before = (d: Date) => sum(mt.filter((t) => new Date(t.date) < d));
  const left = daysLeft(now);
  const remaining = budget - before(today);
  const limit = Math.round(Math.max(0, remaining) / left);
  let base = limit;
  if (today.getDate() > 1) {
    const y = addDays(today, -1);
    const remY = budget - before(y);
    base = Math.round(Math.max(0, remY) / (left + 1));
    if (y < monthStart) base = limit;
  }
  const st = spentToday(txs, now);
  return {
    limit,
    base,
    savedYesterday: limit - base,
    monthBudget: budget,
    remaining,
    daysLeft: left,
    spentToday: st,
    leftToday: limit - st,
  };
}

export const leftToday = (txs: Transaction[], settings: Settings, now: Date) => dailyLimit(txs, settings, now).leftToday;

export type PacePoint = { day: number; value: number };
export type MonthSeries = {
  daysInMonth: number;
  /** cumulative spend at the end of each day 1..today */
  cumulative: PacePoint[];
  /** ideal linear pace for every day 1..daysInMonth */
  ideal: PacePoint[];
  total: number;
  idealToday: number;
  /** idealToday - total: positive = under pace (good) */
  diff: number;
};

export function monthSeries(txs: Transaction[], settings: Settings, now: Date): MonthSeries {
  const n = daysInMonth(now);
  const today = now.getDate();
  const per = new Array(n + 1).fill(0) as number[];
  monthTransactions(txs, now).forEach((t) => {
    per[new Date(t.date).getDate()] += t.amount;
  });
  const cumulative: PacePoint[] = [];
  let c = 0;
  for (let d = 1; d <= today; d++) {
    c += per[d];
    cumulative.push({ day: d, value: c });
  }
  const b = monthBudget(settings);
  const ideal: PacePoint[] = [];
  for (let d = 1; d <= n; d++) ideal.push({ day: d, value: (b / n) * d });
  const idealToday = ideal[today - 1].value;
  return { daysInMonth: n, cumulative, ideal, total: c, idealToday, diff: idealToday - c };
}

export type CategorySpent = { category: Category; spent: number; ratio: number; over: boolean };

export function categorySpent(txs: Transaction[], categories: Category[], now: Date): CategorySpent[] {
  const mt = monthTransactions(txs, now);
  return categories.map((category) => {
    const spent = sum(mt.filter((t) => t.categoryId === category.id));
    const ratio = category.monthlyLimit > 0 ? spent / category.monthlyLimit : 0;
    return { category, spent, ratio, over: ratio > 1 };
  });
}

/**
 * Streak: consecutive days (going back from today) where spend <= that day's limit.
 * Today counts only if currently within the limit. Days before the first transaction are not counted.
 */
export function streak(txs: Transaction[], settings: Settings, now: Date): number {
  if (!txs.length) return 0;
  const first = startOfDay(new Date(Math.min(...txs.map((t) => new Date(t.date).getTime()))));
  let count = 0;
  let day = startOfDay(now);
  for (let i = 0; i < 400 && day >= first; i++) {
    const at = i === 0 ? now : new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59);
    const dl = dailyLimit(txs, settings, at);
    if (dl.spentToday > dl.limit) break;
    count++;
    day = new Date(day.getTime() - DAY + (day.getTimezoneOffset() - new Date(day.getTime() - DAY).getTimezoneOffset()) * 60000);
    day = startOfDay(day);
  }
  return count;
}

export type ParsedItem = { note: string; amount: number; categoryId: string };

export const KEYWORDS: [RegExp, string][] = [
  [/кофе|кафе|обед|ланч|ужин|завтрак|ресторан|пицц|бургер|кофейн|surf/, 'cafe'],
  [/такси|метро|бензин|авто|парковк|автобус|проезд|убер|uber|заправк/, 'transport'],
  [/продукт|магазин|пят[её]р|хлеб|молоко|вкусвилл|перекр[её]ст|овощ|фрукт|рынок|ашан|лента/, 'groceries'],
  [/дет|игруш|школ|кружок|памперс|подгузн/, 'kids'],
  [/аптек|врач|лекарств|стоматолог|анализ|клиник|витамин/, 'health'],
  [/кино|театр|концерт|игр[аы]|боулинг|бар |клуб|парк/, 'fun'],
  [/подписк|netflix|spotify|яндекс плюс|плюс|музык|иви|окко|icloud/, 'subs'],
  [/дом|ремонт|мебел|хозтовар|коммунал|свет|интернет|уборк|ikea|икеа/, 'home'],
];

export function categorize(note: string): string {
  const n = note.toLowerCase();
  for (const [re, id] of KEYWORDS) if (re.test(n + ' ')) return id;
  return 'other';
}

/** "кофе 250, такси 480" -> [{note:'кофе',amount:250,categoryId:'cafe'}, ...]. Unparseable chunks are skipped. */
export function parseQuickInput(text: string): ParsedItem[] {
  const out: ParsedItem[] = [];
  const unit = '(?:\\s*(?:₽|руб\\.?|рублей|р\\.?))?';
  const reTail = new RegExp(`^(.+?)\\s+(\\d[\\d\\s]*(?:[.,]\\d+)?)${unit}$`, 'i');
  const reHead = new RegExp(`^(\\d[\\d\\s]*(?:[.,]\\d+)?)${unit}\\s+(.+)$`, 'i');
  for (const raw of text.split(/[,;\n]+/)) {
    const p = raw.trim();
    if (!p) continue;
    let note: string;
    let amountStr: string;
    const a = p.match(reTail);
    const b = a ? null : p.match(reHead);
    if (a) [, note, amountStr] = a;
    else if (b) [, amountStr, note] = b;
    else continue;
    const amount = Math.round(parseFloat(amountStr.replace(/\s/g, '').replace(',', '.')));
    if (!amount || amount <= 0) continue;
    note = note.trim();
    out.push({ note, amount, categoryId: categorize(note) });
  }
  return out;
}
