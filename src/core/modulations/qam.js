import { grayEncode } from '../utils.js';
import { Q } from '../special.js';

/**
 * Fábrica para esquemas de modulación M-QAM cuadrada con mapeo Gray bidimensional.
 * @param {number} M Número de símbolos (ej. 16, 64)
 * @returns {Readonly<{name: string, M: number, k: number, points: Array<{x: number, y: number, l: number}>, detect: (x: number, y: number) => {x: number, y: number, l: number}, berTheory: (ebn0dB: number) => number}>}
 */
export function createSquareQAM(M) {
  const k = Math.log2(M);
  const L = Math.sqrt(M);
  const h = k / 2;
  const s = 1 / Math.sqrt((2 * (M - 1)) / 3);

  const points = [];
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      points.push(
        Object.freeze({
          x: (2 * i - (L - 1)) * s,
          y: (2 * j - (L - 1)) * s,
          l: (grayEncode(i) << h) | grayEncode(j)
        })
      );
    }
  }

  const frozenPoints = Object.freeze(points);
  const name = `${M}-QAM`;

  return Object.freeze({
    name,
    M,
    k,
    points: frozenPoints,

    /**
     * Detector óptimo O(1) independiente por componentes en fase (I) y cuadratura (Q).
     * Mapea directamente las coordenadas recibidas a los índices de nivel sin calcular distancias.
     * @param {number} x Componente I recibida
     * @param {number} y Componente Q recibida
     * @returns {{ x: number, y: number, l: number }}
     */
    detect(x, y) {
      let i = Math.round((x / s + (L - 1)) / 2);
      if (i < 0) i = 0;
      else if (i >= L) i = L - 1;

      let j = Math.round((y / s + (L - 1)) / 2);
      if (j < 0) j = 0;
      else if (j >= L) j = L - 1;

      return frozenPoints[i * L + j];
    },

    /**
     * BER teórica estándar para M-QAM cuadrada sobre canal AWGN:
     * BER ≈ (4/k) * (1 - 1/sqrt(M)) * Q(sqrt(3 * k * Eb/N0 / (M - 1)))
     * @param {number} ebn0dB
     * @returns {number}
     */
    berTheory(ebn0dB) {
      const g = Math.pow(10, ebn0dB / 10);
      return Math.min(
        0.5,
        (4 / k) * (1 - 1 / Math.sqrt(M)) * Q(Math.sqrt((3 * k * g) / (M - 1)))
      );
    }
  });
}

export const QAM16 = createSquareQAM(16);
export const QAM64 = createSquareQAM(64);
