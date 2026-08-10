'use client';
import { clsx } from 'clsx';

export function Input({ label, placeholder, value, onChange, type = 'text', className }: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white text-zinc-900 text-[13.5px] border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition placeholder:text-zinc-400"
      />
    </div>
  );
}

export function Select({ label, value, onChange, options, className }: {
  label?: string;
  value?: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="w-full bg-white text-zinc-900 text-[13.5px] border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Textarea({ label, placeholder, value, onChange, rows = 3, className }: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white text-zinc-900 text-[13.5px] border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition placeholder:text-zinc-400 resize-none"
      />
    </div>
  );
}
