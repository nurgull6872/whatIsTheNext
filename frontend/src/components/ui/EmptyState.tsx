import type { ReactNode } from 'react';

import type { MascotProps } from '../mascots';

interface EmptyStateProps {
  /** Genellikle bir maskot bileşeni: `<Butterfly />` veya `<Sprout />`. */
  icon: (props: MascotProps) => ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Icon size={56} />
      <h3 className="font-heading text-lg font-semibold text-bark-800">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-bark-600">{description}</p> : null}
      {action}
    </div>
  );
}
