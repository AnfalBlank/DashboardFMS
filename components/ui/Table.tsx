'use client';
import { clsx } from 'clsx';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="fuel-table">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={className}>{children}</th>;
}

export function Td({ children, className, mono }: { children: React.ReactNode; className?: string; mono?: boolean }) {
  return (
    <td className={clsx(mono && 'font-mono text-[12px] text-zinc-500', className)}>
      {children}
    </td>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function Tr({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(onClick && 'cursor-pointer', className)}
    >
      {children}
    </tr>
  );
}
