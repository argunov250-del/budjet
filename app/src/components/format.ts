/** ru-RU thousands grouping with a thin no-break space (U+202F) */
export function formatNumber(n: number, sep = ' '): string {
  const r = Math.round(n);
  const s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (r < 0 ? '−' : '') + s;
}
export const formatRub = (n: number) => `${formatNumber(n)} ₽`;
