/**
 * Utilidades de formateo numérico y de unidades en español.
 */

const SUPERSCRIPT_MAP = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹'
};

/**
 * Convierte una cadena de exponente o número en superíndices Unicode.
 * @param {string | number} val
 * @returns {string}
 */
export function toSuperscript(val) {
  return String(val)
    .replace('+', '')
    .replace(/[-0-9]/g, c => SUPERSCRIPT_MAP[c] || c);
}

/**
 * Formatea un número en notación científica con superíndices (ej. 1.2×10⁻³).
 * @param {number} p
 * @returns {string}
 */
export function formatScientific(p) {
  if (p === 0 || !Number.isFinite(p)) return '0';
  const [mantissa, exp] = p.toExponential(1).split('e');
  return `${mantissa}×10${toSuperscript(exp)}`;
}

/**
 * Formatea una frecuencia o tasa de modulación de forma limpia sin reemplazos frágiles.
 * @param {number} val Valor numérico
 * @param {'hz' | 'symbols'} [type='hz']
 * @returns {string}
 */
export function formatRate(val, type = 'hz') {
  const units = type === 'symbols' 
    ? { base: 'símb/s', kilo: 'ksímb/s', mega: 'Msímb/s' }
    : { base: 'Hz', kilo: 'kHz', mega: 'MHz' };

  if (val >= 1e6) {
    return `${(val / 1e6).toFixed(2)} ${units.mega}`;
  }
  if (val >= 1e3) {
    return `${(val / 1e3).toFixed(1)} ${units.kilo}`;
  }
  return `${val.toFixed(0)} ${units.base}`;
}

/**
 * Formatea cantidades enteras o grandes números en formato legible en español.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1e9) {
    return `${(n / 1e9).toFixed(2)} mil millones`;
  }
  if (n >= 1e6) {
    return `${(n / 1e6).toFixed(2)} millones`;
  }
  return Math.round(n).toLocaleString('es-ES');
}

/**
 * Formatea duración temporal en unidades adecuadas (µs, ms, s, min).
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds < 1e-3) {
    return `${(seconds * 1e6).toFixed(1)} µs`;
  }
  if (seconds < 1) {
    return `${(seconds * 1e3).toFixed(1)} ms`;
  }
  if (seconds < 60) {
    return `${seconds.toFixed(2)} s`;
  }
  return `${(seconds / 60).toFixed(2)} min`;
}
