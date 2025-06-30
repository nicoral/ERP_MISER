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
