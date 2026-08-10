'use client';
import { clsx } from 'clsx';

type KpiAccent = 'black' | 'green' | 'amber' | 'red' | 'blue';

const accentCls: Record<KpiAccent, string> = {
  black: 'bg-black',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export function KpiCard({ eyebrow, value, unit, meta, delta, deltaDir = 'neutral', accent = 'black', className }: {
  eyebrow: string;
  value: string;
  unit?: string;
  meta?: string;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'neutral';
  accent?: KpiAccent;
  className?: string;
}) {
  const deltaColor = deltaDir === 'up'
    ? 'bg-green-50 text-green-700'
    : deltaDir === 'down'
    ? 'bg-red-50 text-red-700'
    : 'bg-zinc-100 text-zinc-500';

  return (
    <div className={clsx(
      'bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden',
      'shadow-[0_4px_6px_rgba(0,0,0,.04),0_1px_3px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)]',
      className
    )}>
      {/* accent bar top */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[3px] rounded-t-xl', accentCls[accent])} />

      <p className="text-[10px] font-medium tracking-[0.6px] uppercase text-zinc-400 mb-2 mt-1">{eyebrow}</p>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-[26px] font-light tracking-tight text-zinc-900 leading-none">{value}</span>
        {unit && <span className="text-[13px] text-zinc-400 font-normal">{unit}</span>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {delta && (
          <span className={clsx('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', deltaColor)}>
            {delta}
          </span>
        )}
        {meta && <span className="text-[12px] text-zinc-400">{meta}</span>}
      </div>
    </div>
  );
}
