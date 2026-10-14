import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, required, error, className, children }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

const CONTROL =
  'w-full rounded-lg border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 hover:border-paper-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(CONTROL, className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(CONTROL, 'cursor-pointer', className)} {...props}>
        {children}
      </select>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(CONTROL, 'min-h-[90px] resize-y', className)} {...props} />;
  },
);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Icon
        name="search"
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-300 transition hover:text-ink-600"
          aria-label="Очистить поиск"
        >
          <Icon name="x" size={13} />
        </button>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(CONTROL, 'pl-9', value && 'pr-8')}
      />
    </div>
  );
}