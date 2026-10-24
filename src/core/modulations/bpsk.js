import { Q } from '../special.js';

const POINTS = [
  Object.freeze({ x: 1, y: 0, l: 0 }),
  Object.freeze({ x: -1, y: 0, l: 1 })
];

export const BPSK = Object.freeze({
  name: 'BPSK',
  M: 2,
  k: 1,
  points: POINTS,

  /**
   * Detector óptimo de mínima distancia (ML) O(1).
   * Decisión en el semiplano x >= 0.
   * @param {number} x
   * @param {number} y
   * @returns {{ x: number, y: number, l: number }}
   */
  detect(x, y) {
    return x >= 0 ? POINTS[0] : POINTS[1];
  },

  /**
   * BER teórica exacta para BPSK sobre canal AWGN: Q(sqrt(2 * Eb/N0)).
   * @param {number} ebn0dB
   * @returns {number}
   */
  berTheory(ebn0dB) {
    const g = Math.pow(10, ebn0dB / 10);
    return Q(Math.sqrt(2 * g));
  }
});
