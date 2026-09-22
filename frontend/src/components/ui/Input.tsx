import { type InputHTMLAttributes, forwardRef, useId } from 'react';

import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/** Her zaman görünür bir `<label>` ile gelir; hata `aria-live="polite"` ile duyurulur (§6.5). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="font-medium text-sm text-bark-800">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-xl border-2 border-bark-200 bg-garden-card px-4 py-2.5 text-bark-800',
            'placeholder:text-bark-400 transition-colors',
            'focus:border-leaf-500 focus:outline-none',
            error && 'border-ladybug-500 focus:border-ladybug-500',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        {hint && !error ? (
          <p id={hintId} className="text-xs text-bark-600">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs font-medium text-ladybug-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
