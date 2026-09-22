import type { MascotProps } from './types';

/** Oy verildiğinde ekranda yürüyen uğur böceği; logonun yanında da kullanılır. */
export function Ladybug({ className, size = 32, title }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="16" cy="18" rx="11" ry="9" fill="var(--color-ladybug-500)" />
      <path d="M16 9v18" stroke="var(--color-bark-800)" strokeWidth="1.2" />
      <path d="M5 18h22" stroke="var(--color-bark-800)" strokeWidth="1.2" />
      <circle cx="11" cy="15" r="1.6" fill="var(--color-bark-800)" />
      <circle cx="10" cy="21" r="1.6" fill="var(--color-bark-800)" />
      <circle cx="21" cy="15" r="1.6" fill="var(--color-bark-800)" />
      <circle cx="22" cy="21" r="1.6" fill="var(--color-bark-800)" />
      <path
        d="M8 10c2-2.5 5-3.5 8-3.5s6 1 8 3.5"
        stroke="var(--color-bark-800)"
        strokeWidth="0"
        fill="var(--color-bark-800)"
      />
      <ellipse cx="16" cy="8" rx="6.5" ry="4" fill="var(--color-bark-800)" />
      <circle cx="13.2" cy="7.3" r="1" fill="white" />
      <circle cx="18.8" cy="7.3" r="1" fill="white" />
      <path
        d="M11 6.5c-2-1-3.6-.5-4.6.8"
        stroke="var(--color-bark-800)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M21 6.5c2-1 3.6-.5 4.6.8"
        stroke="var(--color-bark-800)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
