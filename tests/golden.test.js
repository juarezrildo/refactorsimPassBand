import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { simulate, calculateRequiredEbN0, calculateTheoreticalBER } from '../src/core/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const goldenPath = path.join(__dirname, 'golden/v1.json');
const goldenData = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));

describe('Regresión Dorada (Golden Tests v1.1 vs v1.0)', () => {
  it('debe coincidir exactamente en la Eb/N0 requerida para BER 10^-5', () => {
    for (const [mod, expectedEbN0] of Object.entries(goldenData.theoryEbN0For1eNeg5)) {
      const computed = calculateRequiredEbN0(mod, 1e-5);
      expect(computed).toBeCloseTo(expectedEbN0, 5);
    }
  });

  describe('360 escenarios de simulación Monte Carlo', () => {
    for (const entry of goldenData.results) {
      const testName = `${entry.mod} | Eb/N0=${entry.ebn0}dB | N=${entry.N} | seed=${entry.seed}`;

      it(testName, () => {
        const sim = simulate({
          modulation: entry.mod,
          ebn0dB: entry.ebn0,
          nSymbols: entry.N,
          seed: entry.seed
        });

        // Verificación de bits totales
        expect(sim.bits).toBe(entry.bits);

        // Verificación de conteo exacto de errores de bit
        expect(sim.be).toBe(entry.be);

        // Verificación de conteo exacto de errores de símbolo
        expect(sim.se).toBe(entry.se);

        // Verificación de BER teórica calculada
        const berTh = calculateTheoreticalBER(entry.mod, entry.ebn0);
        expect(berTh).toBeCloseTo(entry.berTheory, 10);
      });
    }
  });
});
