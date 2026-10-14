import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger' | 'dangerGhost';
type Size = 'sm' | 'md' | 'icon' | 'iconSm';

const BASE =
  'inline-flex select-none items-center justify-center rounded-lg font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-brand-400 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  dark: 'bg-ink-950 text-paper-50 hover:bg-ink-800',
  outline: 'border border-paper-300 bg-white text-ink-800 hover:border-ink-200 hover:bg-paper-50',
  ghost: 'text-ink-600 hover:bg-ink-900/5 hover:text-ink-950',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  dangerGhost: 'text-red-600 hover:bg-red-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  icon: 'size-9',
  iconSm: 'size-8',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  className?: string;
  children?: ReactNode;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link to={to} className={cn(BASE, VARIANTS[variant], SIZES[size], className)}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  tone?: 'default' | 'danger';
  size?: 'icon' | 'iconSm';
}

export function IconButton({
  icon,
  tone = 'default',
  size = 'icon',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        BASE,
        tone === 'danger'
          ? 'text-ink-400 hover:bg-red-50 hover:text-red-600'
          : 'text-ink-400 hover:bg-ink-900/5 hover:text-ink-900',
        SIZES[size],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={16} strokeWidth={2} />
    </button>
  );
}