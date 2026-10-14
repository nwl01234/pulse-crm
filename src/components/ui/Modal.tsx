import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function Modal({ open, title, onClose, children, footer, width = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="fixed inset-0 animate-fade-in bg-ink-950/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative mx-auto flex min-h-full items-start justify-center px-4 py-8 sm:py-14">
        <div className={cn('w-full animate-pop-in rounded-2xl bg-white shadow-pop', width)}>
          <div className="flex items-center justify-between gap-4 border-b border-paper-200 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink-950">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-ink-400 transition hover:bg-paper-200 hover:text-ink-900"
              aria-label="Закрыть"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <div className="px-5 py-5">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 rounded-b-2xl border-t border-paper-200 bg-paper-50/70 px-5 py-3.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Удалить',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600">
          <Icon name="alert" size={17} strokeWidth={2} />
        </span>
        <p className="text-sm leading-relaxed text-ink-600">{message}</p>
      </div>
    </Modal>
  );
}