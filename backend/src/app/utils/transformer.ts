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

/**
 * Obtiene la fecha y hora actual en UTC-5
 * @returns La fecha y hora actual en formato 'YYYY-MM-DD HH:mm:ss'
 * @example
 * getCurrentDateTimeMinus5() => "2025-06-17 10:00:00"
 */
export function getCurrentDateTimeMinus5(): string {
  // Obtiene la fecha actual en UTC
  const now = new Date();

  // Ajusta a UTC-5
  const utcMinus5 = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  // Formatea a 'YYYY-MM-DD HH:mm:ss'
  const year = utcMinus5.getFullYear();
  const month = String(utcMinus5.getMonth() + 1).padStart(2, '0');
  const day = String(utcMinus5.getDate()).padStart(2, '0');
  const hours = String(utcMinus5.getHours()).padStart(2, '0');
  const minutes = String(utcMinus5.getMinutes()).padStart(2, '0');
  const seconds = String(utcMinus5.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
