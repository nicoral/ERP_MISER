/**
 * Compara dos arrays y devuelve los elementos eliminados y agregados
 * @param array1 - Array original
 * @param array2 - Array nuevo
 * @returns Objeto con arrays de elementos eliminados y agregados
 */
export function compareArrays<T>(
  array1: T[],
  array2: T[]
): {
  eliminated: T[];
  added: T[];
  equal: T[];
} {
  const set1 = new Set(array1);
  const set2 = new Set(array2);

  const eliminated = array1.filter(item => !set2.has(item));
  const added = array2.filter(item => !set1.has(item));
  const equal = array1.filter(item => set2.has(item));

  return { eliminated, added, equal };
}

/**
 * Compara dos arrays de números y devuelve los elementos eliminados y agregados
 * @param array1 - Array original de números
 * @param array2 - Array nuevo de números
 * @returns Objeto con arrays de números eliminados y agregados
 */
export function compareArraysNumbers(
  array1: number[],
  array2: number[]
): {
  eliminated: number[];
  added: number[];
  equal: number[];
} {
  return compareArrays(array1, array2);
}

/**
 * Verifica si dos arrays son iguales (mismos elementos en cualquier orden)
 * @param array1 - Primer array
 * @param array2 - Segundo array
 * @returns true si los arrays son iguales, false en caso contrario
 */
export function arraysAreEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;

  const set1 = new Set(array1);
  const set2 = new Set(array2);

  return (
    array1.every(item => set2.has(item)) && array2.every(item => set1.has(item))
  );
}

/**
 * Convierte un número a letras en español y agrega el texto de la moneda correspondiente
 * @param value - Número a convertir
 * @param currency - Moneda ('USD' o 'PEN')
 * @returns Cadena con el número en letras y el texto de la moneda
 */
export const numberToSpanishWordsCurrency = (
  value: number,
  currency: 'USD' | 'PEN' = 'USD'
) => {
  const UNITS = [
    '',
    'UNO',
    'DOS',
    'TRES',
    'CUATRO',
    'CINCO',
    'SEIS',
    'SIETE',
    'OCHO',
    'NUEVE',
    'DIEZ',
    'ONCE',
    'DOCE',
    'TRECE',
    'CATORCE',
    'QUINCE',
    'DIECISÉIS',
    'DIECISIETE',
    'DIECIOCHO',
    'DIECINUEVE',
    'VEINTE',
  ];
  const TENS = [
    '',
    '',
    'VEINTE',
    'TREINTA',
    'CUARENTA',
    'CINCUENTA',
    'SESENTA',
    'SETENTA',
    'OCHENTA',
    'NOVENTA',
  ];
  const HUNDREDS = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
  ];

  const tensAndUnits = (n: number) => {
    if (n <= 20) return UNITS[n];
    if (n < 30) return 'VEINTI' + UNITS[n - 20].toLowerCase();
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return TENS[ten] + (unit ? ' Y ' + UNITS[unit] : '');
  };

  const hundredsToWords = (n: number) => {
    if (n === 100) return 'CIEN';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (HUNDREDS[hundred] + (rest ? ' ' + tensAndUnits(rest) : '')).trim();
  };

  const section = (
    n: number,
    divisor: number,
    singular: string,
    plural: string
  ) => {
    const hundreds = Math.floor(n / divisor);
    const rest = n - hundreds * divisor;
    let words = '';
    if (hundreds > 0) {
      if (hundreds === 1) {
        words = singular;
      } else {
        words = numberToWords(hundreds) + ' ' + plural;
      }
    }
    return { words, rest };
  };

  const numberToWords = (n: number) => {
    if (n === 0) return 'CERO';
    if (n < 100) return tensAndUnits(n);
    if (n < 1000) return hundredsToWords(n);

    const millions = section(n, 1000000, 'UN MILLÓN', 'MILLONES');
    const thousands = section(millions.rest, 1000, 'MIL', 'MIL');
    const hundreds = millions.rest % 1000;

    let words = millions.words;
    if (thousands.words) words += (words ? ' ' : '') + thousands.words;
    if (hundreds) words += (words ? ' ' : '') + numberToWords(hundreds);

    return words.trim();
  };

  const [integer, decimal] = value.toFixed(2).split('.');
  const words = numberToWords(parseInt(integer, 10));
  let currencyText = '';
  if (currency === 'USD') currencyText = 'DÓLARES AMERICANOS';
  else if (currency === 'PEN') currencyText = 'SOLES';
  else currencyText = currency;
  return `${words} CON ${decimal}/100 ${currencyText}`;
};
