import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Koşullu class isimlerini birleştirir, çakışan Tailwind sınıflarını (örn. iki farklı `p-*`) çözer. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
