import { Bee, Daisy } from '../mascots';
import { cn } from '../../lib/cn';

interface SpinnerProps {
  className?: string;
  /** Ekran okuyucular için; görsel olarak gizlenir. */
  label?: string;
}

/** Papatyanın etrafında dönen bir arı (§6.4). `prefers-reduced-motion`'da durur. */
export function Spinner({ className, label = 'Yükleniyor' }: SpinnerProps) {
  return (
    <div className={cn('relative h-12 w-12', className)} role="status">
      <Daisy size={22} className="absolute inset-0 m-auto" />
      <div className="absolute inset-0 animate-orbit">
        <Bee
          size={16}
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 animate-counter-orbit"
        />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
