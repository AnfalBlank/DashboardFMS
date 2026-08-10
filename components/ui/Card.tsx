'use client';
import { clsx } from 'clsx';

export function Card({ children, className, padding = true, id, onClick }: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  id?: string;
  onClick?: () => void;
}) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-zinc-200',
        'shadow-[0_4px_6px_rgba(0,0,0,.04),0_1px_3px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)]',
        padding && 'p-5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, meta, action, className }: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-3">
        <h3 className="text-[13px] font-semibold text-zinc-900">{title}</h3>
        {meta && <span className="text-[12px] text-zinc-400">{meta}</span>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
