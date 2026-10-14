import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import type { Priority, Tone } from '../../types';
import { Icon } from './Icon';
import { addDaysISO, formatDate, todayISO } from '../../utils/format';
import { PRIORITY_META } from '../../utils/meta';

export const TONE_BADGE: Record<Tone, string> = {
  green: 'bg-brand-50 text-brand-700 ring-brand-600/25',
  amber: 'bg-gold-50 text-gold-700 ring-gold-500/30',
  red: 'bg-red-50 text-red-700 ring-red-500/25',
  gray: 'bg-paper-200/80 text-ink-500 ring-ink-900/10',
  blue: 'bg-sky-50 text-sky-700 ring-sky-500/25',
  ink: 'bg-ink-900 text-paper-50 ring-ink-900',
};

/** Насыщенные фоны для иконок-чипов (карточки дашборда, лента активности). */
export const TONE_BG: Record<Tone, string> = {
  green: 'bg-brand-100 text-brand-700',
  amber: 'bg-gold-100 text-gold-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-paper-200 text-ink-500',
  blue: 'bg-sky-100 text-sky-700',
  ink: 'bg-ink-900 text-paper-50',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'gray', children, className }: BadgeProps) {
  return <span className={cn('chip ring-1 ring-inset', TONE_BADGE[tone], className)}>{children}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge tone={meta.tone}>
      <Icon name="flag" size={10} strokeWidth={2.4} />
      {meta.label}
    </Badge>
  );
}

interface DeadlineChipProps {
  date: string;
  done?: boolean;
  className?: string;
}

/** Дедлайн с подсветкой: просрочено / сегодня / скоро. */
export function DeadlineChip({ date, done = false, className }: DeadlineChipProps) {
  const today = todayISO();
  const overdue = date < today;
  const isToday = date === today;
  const soon = !overdue && !isToday && date <= addDaysISO(2);
  const label = overdue ? `${formatDate(date)}` : isToday ? 'сегодня' : formatDate(date);
  return (
    <span
      title={`Дедлайн: ${formatDate(date)}`}
      className={cn(
        'chip font-mono font-medium ring-1 ring-inset',
        done
          ? 'bg-paper-200 text-ink-300 ring-ink-900/5'
          : overdue
            ? 'bg-red-50 text-red-600 ring-red-500/25'
            : isToday || soon
              ? 'bg-gold-50 text-gold-600 ring-gold-500/30'
              : 'bg-paper-200 text-ink-500 ring-ink-900/10',
        className,
      )}
    >
      <Icon name={overdue && !done ? 'alert' : 'calendar'} size={11} strokeWidth={2.2} />
      {overdue && !done ? 'просрочено' : label}
    </span>
  );
}