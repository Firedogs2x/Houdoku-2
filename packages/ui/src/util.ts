import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type InteractiveCursorOptions = {
  disabled?: boolean;
  enabledClassName?: string;
  disabledClassName?: string;
};

export function interactiveCursor(options: InteractiveCursorOptions = {}) {
  const {
    disabled = false,
    enabledClassName = 'cursor-pointer',
    disabledClassName = 'cursor-not-allowed',
  } = options;

  return disabled ? disabledClassName : enabledClassName;
}
