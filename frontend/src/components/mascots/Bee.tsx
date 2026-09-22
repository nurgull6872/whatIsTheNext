import type { MascotProps } from './types';

/** Yükleniyor animasyonunda çiçeğin etrafında döner. */
export function Bee({ className, size = 28, title }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="10" cy="11" rx="5" ry="4" fill="var(--color-sky-100)" opacity="0.8" />
      <ellipse cx="17" cy="11" rx="5" ry="4" fill="var(--color-sky-100)" opacity="0.8" />
      <rect x="8" y="13" width="12" height="9" rx="4.5" fill="var(--color-honey-400)" />
      <rect x="8" y="15.5" width="12" height="2" fill="var(--color-bark-800)" />
      <rect x="8" y="19" width="12" height="2" fill="var(--color-bark-800)" />
      <circle cx="14" cy="14" r="4.5" fill="var(--color-bark-800)" />
      <circle cx="12.3" cy="13.3" r="0.9" fill="white" />
      <circle cx="15.7" cy="13.3" r="0.9" fill="white" />
      <path
        d="M11.5 10.5c-.8-1-.8-2 0-2.7"
        stroke="var(--color-bark-800)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M16.5 10.5c.8-1 .8-2 0-2.7"
        stroke="var(--color-bark-800)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
