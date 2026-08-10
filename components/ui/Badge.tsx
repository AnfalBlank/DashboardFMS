'use client';
import { clsx } from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'dark';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-green-700 border border-green-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  critical: 'bg-red-50 text-red-700 border border-red-100',
  info: 'bg-blue-50 text-blue-700 border border-blue-100',
  neutral: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  dark: 'bg-black text-white',
};

export function Badge({ variant = 'neutral', children, className }: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase whitespace-nowrap',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function StatusDot({ variant }: { variant: BadgeVariant }) {
  const colors: Record<BadgeVariant, string> = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-zinc-400',
    dark: 'bg-black',
  };
  return <span className={clsx('inline-block w-1.5 h-1.5 rounded-full', colors[variant])} />;
}

export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    SUCCESS: 'success', ACTIVE: 'success', NORMAL: 'success', CONFIRMED: 'success', PERFECT: 'success', SYNCED: 'success', APPROVED: 'success',
    WARNING: 'warning', LOW: 'warning', PENDING: 'warning', ANOMALY: 'warning', SUSPENDED: 'warning',
    CRITICAL: 'critical', FAILED: 'critical', BLOCKED: 'critical', CANCELLED: 'critical', VOID: 'critical',
    INFO: 'info', HIGH: 'info',
    INACTIVE: 'neutral', OFFLINE: 'neutral', EXPIRED: 'neutral', CLOSED: 'neutral',
  };
  return map[status] ?? 'neutral';
}
