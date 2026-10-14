import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, text, action, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-paper-400/80 bg-white/60 px-6 text-center',
        compact ? 'py-8' : 'py-14',
      )}
    >
      <span className="grid size-12 place-items-center rounded-xl bg-ink-950 text-brand-300 shadow-sm">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}