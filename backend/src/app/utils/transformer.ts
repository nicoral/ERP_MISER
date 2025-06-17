/**
 * Formats a number with leading zeros
 * @param value - The number to format
 * @param padding - The total length of the resulting string (default: 10)
 * @param prefix - Optional prefix to add before the padded number
 * @example
 * formatNumber(43) => "0000000043"
 * formatNumber(43, 5) => "00043"
 * formatNumber(43, 8, "ID-") => "ID-00000043"
 */
export function formatNumber(
  value: number | string,
  padding: number = 10,
  prefix: string = ''
): string {
  const numberStr = value.toString();
  const paddedNumber = numberStr.padStart(padding, '0');
  return `${prefix}${paddedNumber}`;
}