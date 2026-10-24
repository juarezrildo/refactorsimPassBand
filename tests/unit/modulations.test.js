import { describe, it, expect } from 'vitest';
import {
  BPSK,
  QPSK,
  PSK8,
  QAM16,
  QAM64,
  Q,
  erfc,
  popCount,
  grayEncode,
  hammingDistance,
  registry
} from '../../src/core/index.js';

describe('Funciones Matemáticas Especiales y Utilidades', () => {
  it('Q(0) debe ser exactamente 0.5', () => {
    expect(Q(0)).toBeCloseTo(0.5, 6);
  });

  it('erfc(0) debe ser 1 y erfc(5) tender a 0', () => {
    expect(erfc(0)).toBeCloseTo(1, 6);
    expect(erfc(5)).toBeLessThan(1e-11);
  });

  it('popCount y hammingDistance deben calcular correctamente los bits', () => {
    expect(popCount(0)).toBe(0);
    expect(popCount(1)).toBe(1);
    expect(popCount(0b1101)).toBe(3);
    expect(hammingDistance(0b1010, 0b1001)).toBe(2);
  });

  it('grayEncode genera código Gray donde enteros adyacentes difieren en 1 bit', () => {
    for (let i = 0; i < 63; i++) {
      const g1 = grayEncode(i);
      const g2 = grayEncode(i + 1);
      expect(hammingDistance(g1, g2)).toBe(1);
    }
  });
});

describe('Propiedades Físicas de las Modulaciones', () => {
  const schemes = [BPSK, QPSK, PSK8, QAM16, QAM64];

  for (const scheme of schemes) {
    describe(`${scheme.name}`, () => {
      it(`debe tener M=${scheme.M} y k=log2(M)=${scheme.k}`, () => {
        expect(scheme.points.length).toBe(scheme.M);
        expect(scheme.k).toBe(Math.log2(scheme.M));
      });

      it('debe tener energía media por símbolo normalizada Es = 1 (dentro de tolerancia)', () => {
        const sumEnergy = scheme.points.reduce((acc, p) => acc + (p.x * p.x + p.y * p.y), 0);
        const avgEnergy = sumEnergy / scheme.M;
        expect(avgEnergy).toBeCloseTo(1.0, 5);
      });

      it('debe estar registrado en el ModulationRegistry', () => {
        expect(registry.get(scheme.name)).toBe(scheme);
      });
    });
  }

  it('16-QAM debe tener vecinos adyacentes a 1 bit de distancia (Gray bidimensional)', () => {
    const L = 4;
    const s = 1 / Math.sqrt((2 * 15) / 3);
    // Verificar que los vecinos horizontales y verticales inmediatos difieran en solo 1 bit
    for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        const current = QAM16.points[i * L + j];
        if (i + 1 < L) {
          const nextI = QAM16.points[(i + 1) * L + j];
          expect(hammingDistance(current.l, nextI.l)).toBe(1);
        }
        if (j + 1 < L) {
          const nextJ = QAM16.points[i * L + (j + 1)];
          expect(hammingDistance(current.l, nextJ.l)).toBe(1);
        }
      }
    }
  });
});
