export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  return `${words} CON ${decimal}/100 ${currencyText}`.toUpperCase();
};
