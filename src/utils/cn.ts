/** Склейка css-классов с фильтрацией ложных значений. */
export function cn(...parts: Array<string | number | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}