import type { MascotProps } from './types';

/** Boş durum ekranlarında ve sayfa geçişlerinde kullanılır. */
export function Butterfly({ className, size = 40, title }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d="M20 12c-2-6-9-9-13-6s-2 11 4 13c4 1.5 8-1 9-4" fill="var(--color-sky-300)" />
      <path d="M20 12c2-6 9-9 13-6s2 11-4 13c-4 1.5-8-1-9-4" fill="var(--color-lavender-400)" />
      <path
        d="M20 14c-1.5-3-6-4.5-9-3s-2 7 2.5 8.5c2.5 1 5.5-.5 6.5-3"
        fill="var(--color-petal-200)"
      />
      <path
        d="M20 14c1.5-3 6-4.5 9-3s2 7-2.5 8.5c-2.5 1-5.5-.5-6.5-3"
        fill="var(--color-honey-400)"
      />
      <path d="M20 10v18" stroke="var(--color-bark-800)" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M20 11c-1.5-1.5-2-2.5-1.5-4"
        stroke="var(--color-bark-800)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M20 11c1.5-1.5 2-2.5 1.5-4"
        stroke="var(--color-bark-800)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
