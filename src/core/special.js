/**
 * Funciones matemáticas especiales para cálculo analítico de BER.
 */

/**
 * Función de error complementaria (aproximación numérica de Abramowitz y Stegun 7.1.26).
 * Precisión máxima: error relativo < 1.5e-7.
 * @param {number} x
 * @returns {number}
 */
export function erfc(x) {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const r = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z);
  return x >= 0 ? r : 2 - r;
}

/**
 * Función Q de Marcum / Gaussiana: cola superior de la distribución normal estándar.
 * Q(x) = (1/2) * erfc(x / sqrt(2))
 * @param {number} x
 * @returns {number}
 */
export function Q(x) {
  return 0.5 * erfc(x / Math.SQRT2);
}
