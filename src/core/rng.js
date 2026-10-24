/**
 * Generador de números pseudoaleatorios Mulberry32.
 * Rápido, de 32 bits, con excelente distribución y determinismo total por semilla.
 * 
 * @param {number} seed Semilla inicial (entero)
 * @returns {() => number} Función generadora que retorna valores uniformes en el intervalo [0, 1)
 */
export function createRNG(seed = 1) {
  let a = (+seed || 1) | 0;
  return function next() {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
