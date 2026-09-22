import { motion } from 'motion/react';

import { cn } from '../lib/cn';
import type { PollOption } from '../types/poll';

interface OptionBarProps {
  option: PollOption;
  /** Bu seçeneğe daha önce oy verildi mi (§5.4 `my_vote`). */
  isSelected?: boolean;
  /** Kapalı ankette en çok oy alan seçenek (§6.5: renk tek başına bilgi taşımaz). */
  isWinner?: boolean;
  /** Palette rotasyonundaki sırası: leaf → honey → sky → lavender → petal (§6.1). */
  colorIndex?: number;
  onSelect?: () => void;
  disabled?: boolean;
}

const BAR_COLORS = ['bg-leaf-500', 'bg-honey-400', 'bg-sky-300', 'bg-lavender-400', 'bg-petal-200'];

export function OptionBar({
  option,
  isSelected = false,
  isWinner = false,
  colorIndex = 0,
  onSelect,
  disabled = false,
}: OptionBarProps) {
  const barColor = BAR_COLORS[colorIndex % BAR_COLORS.length];
  const interactive = Boolean(onSelect) && !disabled;

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-2 bg-leaf-100/30 px-4 py-3 transition-colors',
        isSelected ? 'border-leaf-600' : 'border-bark-200/60',
        interactive && 'hover:border-leaf-500',
      )}
    >
      <motion.div
        className={cn('absolute inset-y-0 left-0 opacity-25', barColor)}
        initial={false}
        animate={{ width: `${option.percentage}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-medium text-bark-800">
          {isSelected ? (
            <span className="text-leaf-700" aria-hidden="true">
              ✓
            </span>
          ) : null}
          {option.text}
          {isWinner ? (
            <span className="font-semibold text-ladybug-600">
              🏆 <span className="sr-only">Kazanan seçenek</span>
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-sm font-semibold text-bark-600">
          %{option.percentage.toFixed(1)} · {option.vote_count} oy
        </span>
      </div>
    </div>
  );

  if (!interactive) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="block w-full text-left disabled:cursor-not-allowed disabled:opacity-70"
    >
      {content}
    </button>
  );
}
