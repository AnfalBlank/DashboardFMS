'use client';

export function PageHeader({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-light tracking-tight text-zinc-900">{title}</h1>
        {subtitle && <p className="text-[13px] text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold tracking-[0.6px] uppercase text-zinc-400 mb-3">{children}</p>
  );
}
