import type { ActivityType, ClientStatus, DealStage, Priority, TaskStatus, Tone } from '../types';
import type { IconName } from '../components/ui/Icon';

export const CLIENT_STATUS_META: Record<ClientStatus, { label: string; tone: Tone }> = {
  lead: { label: 'Лид', tone: 'amber' },
  active: { label: 'Активный', tone: 'green' },
  inactive: { label: 'Неактивный', tone: 'gray' },
};

/** Порядок этапов воронки. */
export const DEAL_STAGES: DealStage[] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

/** Этапы, которые считаются «в работе» (всё, кроме выигранных/проигранных). */
export const OPEN_STAGES: DealStage[] = ['new', 'qualified', 'proposal', 'negotiation'];

export const DEAL_STAGE_META: Record<
  DealStage,
  { label: string; tone: Tone; dot: string; bar: string }
> = {
  new: { label: 'Новая', tone: 'blue', dot: 'bg-sky-500', bar: 'bg-sky-400' },
  qualified: { label: 'Квалификация', tone: 'green', dot: 'bg-brand-400', bar: 'bg-brand-300' },
  proposal: { label: 'Предложение', tone: 'green', dot: 'bg-brand-600', bar: 'bg-brand-500' },
  negotiation: { label: 'Переговоры', tone: 'amber', dot: 'bg-gold-500', bar: 'bg-gold-400' },
  won: { label: 'Выиграна', tone: 'ink', dot: 'bg-brand-700', bar: 'bg-brand-700' },
  lost: { label: 'Проиграна', tone: 'red', dot: 'bg-red-400', bar: 'bg-red-300' },
};

export const PRIORITY_META: Record<Priority, { label: string; tone: Tone; flag: string }> = {
  high: { label: 'Высокий', tone: 'red', flag: 'text-red-500' },
  medium: { label: 'Средний', tone: 'amber', flag: 'text-gold-500' },
  low: { label: 'Низкий', tone: 'gray', flag: 'text-ink-300' },
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; tone: Tone }> = {
  todo: { label: 'К выполнению', tone: 'gray' },
  in_progress: { label: 'В работе', tone: 'blue' },
  done: { label: 'Выполнена', tone: 'green' },
};

export const ACTIVITY_META: Record<ActivityType, { label: string; icon: IconName; tone: Tone }> = {
  call: { label: 'Звонок', icon: 'phone', tone: 'blue' },
  meeting: { label: 'Встреча', icon: 'video', tone: 'amber' },
  email: { label: 'Письмо', icon: 'mail', tone: 'gray' },
  note: { label: 'Заметка', icon: 'note', tone: 'green' },
  stage_change: { label: 'Смена этапа', icon: 'kanban', tone: 'ink' },
  created: { label: 'Создание', icon: 'sparkle', tone: 'gray' },
};

/** Типы активности, которые пользователь может создать вручную. */
export const MANUAL_ACTIVITY_TYPES: ActivityType[] = ['note', 'call', 'email', 'meeting'];