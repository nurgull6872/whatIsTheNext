import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Üzerine gelince hafifçe yükselir; anket kartları gibi tıklanabilir yüzeylerde kullanılır. */
  interactive?: boolean;
}

export function Card({ children, interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-bark-200/60 bg-garden-card p-5 shadow-garden',
        interactive && 'transition-shadow hover:shadow-garden-lg',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
