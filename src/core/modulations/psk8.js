import { grayEncode } from '../utils.js';
import { Q } from '../special.js';

const M = 8;
const k = 3;
const off = 0;

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

export const PSK8 = Object.freeze({
  name: '8-PSK',
  M,
  k,
  points: POINTS,

  /**
   * Detector por mínima distancia euclidiana (ML).
   * @param {number} x
   * @param {number} y
   * @returns {{ x: number, y: number, l: number }}
   */
  detect(x, y) {
    let best = POINTS[0];
    let bestDist = (best.x - x) * (best.x - x) + (best.y - y) * (best.y - y);
    for (let i = 1; i < M; i++) {
      const q = POINTS[i];
      const d = (q.x - x) * (q.x - x) + (q.y - y) * (q.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = q;
      }
    }
    return best;
  },

  /**
   * BER teórica aproximada para 8-PSK con codificación Gray:
   * BER ≈ (2/k) * Q(sqrt(2 * k * Eb/N0) * sin(pi/M))
   * @param {number} ebn0dB
   * @returns {number}
   */
  berTheory(ebn0dB) {
    const g = Math.pow(10, ebn0dB / 10);
    return Math.min(0.5, (2 * Q(Math.sqrt(2 * k * g) * Math.sin(Math.PI / M))) / k);
  }
});
