/**
 * Utilidades para manipulación de bits y codificación.
 */

/**
 * Codificación binaria a código de Gray: G(n) = n ^ (n >> 1)
 * @param {number} n
 * @returns {number}
 */
export const grayEncode = n => n ^ (n >> 1);

/**
 * Cuenta el número de bits activos ('1's) en un entero (peso de Hamming / popcount).
 * @param {number} n
 * @returns {number}
 */
export function popCount(n) {
  let count = 0;
  let val = n;
  while (val) {
    count += val & 1;
    val >>>= 1;
  }
  return count;
}

/**
 * Distancia de Hamming entre dos etiquetas binarias: peso de (a ^ b).
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function hammingDistance(a, b) {
  return popCount(a ^ b);
}
