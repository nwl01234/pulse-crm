import type { Currency } from '../types';

let counter = 0;

/** Человекочитаемый уникальный id с префиксом сущности. */
export function uid(prefix: string): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${random}`;
}

/** Локальная дата в формате YYYY-MM-DD. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** ISO-дата «сколько дней назад» (для правдоподобного сида). */
export function daysAgoISO(days: number, hoursOffset = 0): string {
  return new Date(Date.now() - days * 86_400_000 + hoursOffset * 3_600_000).toISOString();
}

export function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
    .format(date)
    .replace(/\.$/, '');
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(iso)}, ${time}`;
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн назад`;
  return formatDate(iso);
}

export function formatMoney(amount: number, currency: Currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Условные курсы для сведения сумм к RUB на дашборде. */
export const RATE_TO_RUB: Record<Currency, number> = { RUB: 1, USD: 96, EUR: 104 };

export function toRub(amount: number, currency: Currency): number {
  return amount * RATE_TO_RUB[currency];
}

/** Компактная сумма в рублях: «320 тыс ₽», «1,2 млн ₽». */
export function formatMoneyShort(amountRub: number): string {
  if (amountRub >= 1_000_000) {
    return `${(amountRub / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн ₽`;
  }
  if (amountRub >= 1_000) return `${Math.round(amountRub / 1_000)} тыс ₽`;
  return `${Math.round(amountRub)} ₽`;
}

export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '');
  return letters.join('') || '?';
}

/** Русские формы: plural(3, ['задача', 'задачи', 'задач']) → 'задачи'. */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}