import { registry } from './registry.js';

/**
 * Calcula la probabilidad teórica de error de bit (BER) para un esquema y Eb/N0 dados.
 * 
 * @param {string | object} scheme Nombre del esquema o el objeto de modulación
 * @param {number} ebn0dB Relación Eb/N0 en dB
 * @returns {number} BER teórica
 */
export function calculateTheoreticalBER(scheme, ebn0dB) {
  const mod = typeof scheme === 'string' ? registry.get(scheme) : scheme;
  return mod.berTheory(ebn0dB);
}

/**
 * Calcula el valor de Eb/N0 necesario (en dB) para alcanzar una BER objetivo mediante búsqueda binaria.
 * 
 * @param {string | object} scheme Nombre del esquema o el objeto de modulación
 * @param {number} targetBER BER objetivo (por ejemplo 1e-5)
 * @param {number} [iterations=40] Número de iteraciones de bisección
 * @returns {number} Eb/N0 requerida en dB
 */
export function calculateRequiredEbN0(scheme, targetBER = 1e-5, iterations = 40) {
  let lo = 0;
  let hi = 40;
  for (let i = 0; i < iterations; i++) {
    const m = (lo + hi) / 2;
    if (calculateTheoreticalBER(scheme, m) > targetBER) {
      lo = m;
    } else {
      hi = m;
    }
  }
  return hi;
}
