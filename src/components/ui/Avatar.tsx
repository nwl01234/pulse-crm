import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

const PALETTE = [
  'bg-brand-600',
  'bg-ink-700',
  'bg-gold-500',
  'bg-brand-800',
  'bg-ink-500',
  'bg-gold-600',
  'bg-brand-400',
];

/** Детерминированный цвет аватара по имени. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 32, className }: AvatarProps) {
  const tone = PALETTE[hashString(name) % PALETTE.length];
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      className={cn(
        'grid shrink-0 select-none place-items-center rounded-full font-display font-bold text-white',
        tone,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}