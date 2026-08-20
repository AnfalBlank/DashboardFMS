'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, subtitle, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-lg', md: 'max-w-xl', lg: 'max-w-3xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx(
        'relative w-full bg-white rounded-2xl shadow-[0_25px_60px_-10px_rgba(0,0,0,0.3)] animate-fade-in',
        widths[size]
      )}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>
            {subtitle && <p className="text-[12.5px] text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
