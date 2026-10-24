import { describe, it, expect } from 'vitest';
import { calculateLinkBudget, calculateNoiseSigma } from '../../src/core/index.js';

describe('Cálculos de Balance de Enlace (Link Budget)', () => {
  it('debe calcular correctamente tasa de símbolos, ancho de banda y eficiencia para QPSK', () => {
    // Para QPSK: k = 2, Rb = 1000 kbit/s = 1e6 bit/s, rollOff = 0.35
    const res = calculateLinkBudget({
      k: 2,
      bitRate: 1e6,
      rollOff: 0.35,
      ebn0dB: 10,
      fileBytes: 1e6 // 1 MB
    });

    // Rs = Rb / k = 1e6 / 2 = 500,000 símb/s = 500 kbaudio
    expect(res.symbolRate).toBe(500000);

    // B = Rs * (1 + alpha) = 500,000 * 1.35 = 675,000 Hz = 675 kHz
    expect(res.bandwidth).toBe(675000);

    // Eficiencia = k / (1 + alpha) = 2 / 1.35 ≈ 1.48148 bit/s/Hz
    expect(res.spectralEfficiency).toBeCloseTo(2 / 1.35, 5);

    // Es/N0 = Eb/N0 + 10*log10(k) = 10 + 10*log10(2) ≈ 13.0103 dB
    expect(res.esn0dB).toBeCloseTo(10 + 10 * Math.log10(2), 4);

    // Archivo de 1 MB (1e6 bytes): bits = 8e6, símbolos = 4e6
    expect(res.fileBits).toBe(8000000);
    expect(res.fileSymbols).toBe(4000000);

    // Tiempo de transmisión: 8e6 bits / 1e6 bit/s = 8 segundos
    expect(res.transmissionTimeSec).toBe(8.0);
  });

  it('calculateNoiseSigma debe disminuir a mayor Eb/N0', () => {
    const sigma0 = calculateNoiseSigma(2, 0);
    const sigma10 = calculateNoiseSigma(2, 10);
    const sigma20 = calculateNoiseSigma(2, 20);

    expect(sigma0).toBeGreaterThan(sigma10);
    expect(sigma10).toBeGreaterThan(sigma20);
  });
});
