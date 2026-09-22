import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/cn';

type Tone = 'leaf' | 'ladybug' | 'honey' | 'sky' | 'lavender' | 'petal' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

// Renkli metin yerine acik -100 zemin + koyu bark-800 metin + renkli nokta
// kullanilir: dogrudan renkli metin/zemin kombinasyonlarinin cogu AA'yi
// gecemiyordu (theme.css'teki olcumlere bakin), bu desen her zaman >9:1.
const TONE_CLASSES: Record<Tone, string> = {
  leaf: 'bg-leaf-100',
  ladybug: 'bg-ladybug-100',
  honey: 'bg-honey-100',
  sky: 'bg-sky-100',
  lavender: 'bg-lavender-100',
  petal: 'bg-petal-100',
  neutral: 'bg-bark-200/60',
};

const DOT_CLASSES: Record<Tone, string> = {
  leaf: 'bg-leaf-500',
  ladybug: 'bg-ladybug-500',
  honey: 'bg-honey-400',
  sky: 'bg-sky-300',
  lavender: 'bg-lavender-400',
  petal: 'bg-petal-200',
  neutral: 'bg-bark-400',
};

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-bark-800',
        TONE_CLASSES[tone],
        className,
      )}
      {...rest}
    >
      <span className={cn('h-2 w-2 rounded-full', DOT_CLASSES[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}
