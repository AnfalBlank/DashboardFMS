'use client';
import { clsx } from 'clsx';
import React from 'react';

type BtnVariant = 'primary' | 'outline' | 'aloe' | 'ghost' | 'danger';
type BtnSize    = 'sm' | 'md' | 'lg';

const variantCls: Record<BtnVariant, string> = {
  primary: 'bg-black text-white hover:bg-zinc-800 active:bg-zinc-900',
  outline: 'bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100',
  aloe:    'bg-[#c1fbd4] text-zinc-900 hover:bg-[#a8f5be] active:bg-[#8feaa8]',
  ghost:   'bg-transparent text-zinc-600 hover:bg-zinc-100',
  danger:  'bg-red-600 text-white hover:bg-red-700',
};

const sizeCls: Record<BtnSize, string> = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13.5px]',
  lg: 'px-6 py-2.5 text-[14px]',
};

export function Button({
  variant  = 'primary',
  size     = 'md',
  children,
  className,
  onClick,
  disabled,
  type     = 'button',
}: {
  variant?:  BtnVariant;
  size?:     BtnSize;
  children:  React.ReactNode;
  className?: string;
  onClick?:  React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?:     'button' | 'submit' | 'reset';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantCls[variant],
        sizeCls[size],
        className
      )}
    >
      {children}
    </button>
  );
}
