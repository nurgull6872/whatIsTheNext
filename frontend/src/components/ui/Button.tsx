import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Bee } from '../mascots';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Yükleniyor durumunda buton devre dışı kalır ve küçük bir arı döner. */
  isLoading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  // leaf-700 kullanılır: leaf-500/600 üzerinde beyaz metin AA eşiğini geçmiyor (theme.css).
  primary: 'bg-leaf-700 text-white hover:opacity-90 active:opacity-100',
  secondary: 'bg-leaf-100 text-leaf-700 hover:bg-leaf-100/70',
  danger: 'bg-ladybug-600 text-white hover:opacity-90',
  ghost: 'bg-transparent text-bark-800 hover:bg-bark-800/5',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-heading font-semibold',
        'transition-colors duration-150 cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? <Bee size={18} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
