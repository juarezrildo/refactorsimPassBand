import { describe, it, expect } from 'vitest';
import {
  toSuperscript,
  formatScientific,
  formatRate,
  formatNumber,
  formatDuration
} from '../../src/ui/formatters.js';

describe('Formatters', () => {
  it('toSuperscript convierte números y signos negativos a superíndices', () => {
    expect(toSuperscript('-5')).toBe('⁻⁵');
    expect(toSuperscript('10')).toBe('¹⁰');
  });

  it('formatScientific formatea en notación científica clara', () => {
    expect(formatScientific(0)).toBe('0');
    expect(formatScientific(0.0052)).toBe('5.2×10⁻³');
  });

  it('formatRate maneja Hz y símbolos/segundo limpiamente', () => {
    expect(formatRate(500, 'hz')).toBe('500 Hz');
    expect(formatRate(500000, 'symbols')).toBe('500.0 ksímb/s');
    expect(formatRate(2500000, 'hz')).toBe('2.50 MHz');
  });

  it('formatNumber aplica formato legible', () => {
    expect(formatNumber(1500)).toBe((1500).toLocaleString('es'));
    expect(formatNumber(25000)).toBe((25000).toLocaleString('es'));
    expect(formatNumber(2000000)).toBe('2.00 millones');
    expect(formatNumber(5000000000)).toBe('5.00 mil millones');
  });

  it('formatDuration convierte a µs, ms, s y min adecuadamente', () => {
    expect(formatDuration(0.000005)).toBe('5.0 µs');
    expect(formatDuration(0.025)).toBe('25.0 ms');
    expect(formatDuration(4.5)).toBe('4.50 s');
    expect(formatDuration(120)).toBe('2.00 min');
  });
});
