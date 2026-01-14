/**
 * Format price from cents to euros with € symbol
 */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Format price with sign indicator (+/-)
 */
export function formatPriceWithSign(cents: number): string {
  const formatted = formatPrice(Math.abs(cents));
  return cents >= 0 ? `+${formatted}` : `-${formatted}`;
}
