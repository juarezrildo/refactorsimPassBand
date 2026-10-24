/**
 * Cálculos de ingeniería de enlace de comunicaciones digitales.
 */

/**
 * Calcula los parámetros de enlace para una transmisión digital paso banda.
 * 
 * @param {object} params
 * @param {number} params.k Bits por símbolo de la modulación
 * @param {number} params.bitRate Tasa binaria Rb en bit/s
 * @param {number} params.rollOff Factor de exceso de ancho de banda (roll-off) alpha en [0, 1]
 * @param {number} params.ebn0dB Relación Eb/N0 en dB
 * @param {number} params.fileBytes Tamaño de archivo a transmitir en bytes
 * @returns {object} Parámetros de enlace calculados
 */
export function calculateLinkBudget({ k, bitRate, rollOff, ebn0dB, fileBytes = 0 }) {
  const symbolRate = bitRate / k;
  const bandwidth = symbolRate * (1 + rollOff);
  const spectralEfficiency = k / (1 + rollOff);
  const esn0dB = ebn0dB + 10 * Math.log10(k);

  const fileBits = fileBytes * 8;
  const fileSymbols = fileBits / k;
  const transmissionTimeSec = bitRate > 0 ? fileBits / bitRate : 0;

  return {
    symbolRate,
    bandwidth,
    spectralEfficiency,
    esn0dB,
    fileBits,
    fileSymbols,
    transmissionTimeSec
  };
}
