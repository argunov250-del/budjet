import { daysInMonth, monthBudget, monthTransactions } from '../../logic/budget';
import type { Settings, Transaction } from '../../store/types';

/** Assumed monthly contribution pool: unspent part of the month's budget (by current pace), at least 10% of income. */
export function monthlyPool(txs: Transaction[], settings: Settings, now: Date): number {
  const spent = monthTransactions(txs, now).reduce((s, t) => s + t.amount, 0);
  const projected = (spent / Math.max(1, now.getDate())) * daysInMonth(now);
  return Math.max(monthBudget(settings) - projected, settings.monthlyIncome * 0.1);
}

const MONTHS_NOM = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function etaText(remaining: number, perMonth: number, now: Date): string {
  if (remaining <= 0) return 'Цель достигнута';
  if (perMonth <= 0) return 'Темп не определён';
  const months = Math.ceil(remaining / perMonth);
  const d = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return `≈ ${months} мес. · ${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}`;
}
