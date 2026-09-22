import type { MascotProps } from './types';

/** Anket kartı köşe süsü. */
export function Daisy({ className, size = 24, title }: MascotProps) {
  const petals = Array.from({ length: 8 });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <g transform="translate(12 12)">
        {petals.map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-7"
            rx="2.6"
            ry="5"
            fill="var(--color-petal-200)"
            transform={`rotate(${(360 / petals.length) * i})`}
          />
        ))}
        <circle r="4" fill="var(--color-honey-400)" />
      </g>
    </svg>
  );
}
