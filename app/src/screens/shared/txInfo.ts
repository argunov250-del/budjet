import { formatNumber } from '../../components';
import { incomeCategories, type Account, type Category, type IconName, type Transaction } from '../../store';

export type TxView = { title: string; sub: string; amount: string; sign: '+' | '−' | ''; icon: IconName; iconColor?: string; isIncome: boolean };

export function describeTx(tx: Transaction, cats: Category[], accounts: Account[]): TxView {
  const kind = tx.kind ?? 'expense';
  const acc = accounts.find((a) => a.id === tx.accountId);
  const n = formatNumber(tx.amount);
  if (kind === 'transfer') {
    const to = accounts.find((a) => a.id === tx.toAccountId);
    return { title: tx.note || 'Перевод', sub: `${acc?.name ?? '?'} → ${to?.name ?? '?'}`, amount: `${n} ₽`, sign: '', icon: 'repeat', isIncome: false };
  }
  const list = kind === 'income' ? incomeCategories : cats;
  const c = list.find((x) => x.id === tx.categoryId);
  return {
    title: tx.note || c?.name || 'Другое',
    sub: `${c?.name ?? 'Другое'}${acc ? ` · ${acc.name}` : ''}`,
    amount: `${n} ₽`, sign: kind === 'income' ? '+' : '−', icon: c?.icon ?? 'tag', iconColor: c?.color, isIncome: kind === 'income',
  };
}
