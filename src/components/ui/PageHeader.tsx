import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-950">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}