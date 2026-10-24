import { grayEncode } from '../utils.js';
import { Q } from '../special.js';

const M = 4;
const k = 2;
const off = Math.PI / 4;

const POINTS = Object.freeze(
  Array.from({ length: M }, (_, i) => {
    const angle = (2 * Math.PI * i) / M + off;
    return Object.freeze({
      x: Math.cos(angle),
      y: Math.sin(angle),
      l: grayEncode(i)
    });
  })
);

export const QPSK = Object.freeze({
  name: 'QPSK',
  M,
  k,
  points: POINTS,

  /**
   * Detector ML óptimo O(1) basado en cuadrantes cartesianos.
   * Con rotación pi/4, los ejes I y Q son las fronteras de decisión exactas.
   * @param {number} x
   * @param {number} y
   * @returns {{ x: number, y: number, l: number }}
   */
  detect(x, y) {
    if (x >= 0) {
      return y >= 0 ? POINTS[0] : POINTS[3];
    } else {
      return y >= 0 ? POINTS[1] : POINTS[2];
    }
  },

  /**
   * BER teórica exacta para QPSK con mapeo Gray sobre canal AWGN: Q(sqrt(2 * Eb/N0)).
   * @param {number} ebn0dB
   * @returns {number}
   */
  berTheory(ebn0dB) {
    const g = Math.pow(10, ebn0dB / 10);
    return Q(Math.sqrt(2 * g));
  }
});
