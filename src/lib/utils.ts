import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names with support for conditional classes.
 * Uses `clsx` for conditional logic and `tailwind-merge` to handle class conflicts.
 *
 * @param {...ClassValue[]} inputs - The class values to merge.
 * @returns {string} The merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
