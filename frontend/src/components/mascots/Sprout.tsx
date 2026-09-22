import type { MascotProps } from './types';

/** "Henüz oy yok" gibi boş durumlarda kullanılır. */
export function Sprout({ className, size = 32, title }: MascotProps) {
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
      <path
        d="M6 28c8 1 20 1 20 0"
        stroke="var(--color-bark-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M16 28V16" stroke="var(--color-leaf-700)" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 18c0-5-4-7-9-7 0 5 4 8 9 7z" fill="var(--color-leaf-500)" />
      <path d="M16 16c0-6 5-8 10-8 0 6-5 9-10 8z" fill="var(--color-leaf-300)" />
    </svg>
  );
}
