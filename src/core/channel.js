/**
 * Modelo de canal con Ruido Blanco Gaussiano Aditivo (AWGN) en banda base equivalente compleja.
 */

/**
 * Calcula la desviación estándar del ruido por dimensión (I y Q)
 * para una energía media por símbolo Es = 1 y Eb = 1/k.
 * 
 * sigma = sqrt( Eb / (2 * Eb/N0) ) = sqrt( (1 / k) / (2 * 10^(ebn0dB / 10)) )
 * 
 * @param {number} k Bits por símbolo
 * @param {number} ebn0dB Relación Eb/N0 en decibelios
 * @returns {number} Desviación estándar del ruido por dimensión
 */
export function calculateNoiseSigma(k, ebn0dB) {
  const g = Math.pow(10, ebn0dB / 10);
  return Math.sqrt((1 / k) / g / 2);
}

/**
 * Aplica ruido AWGN complejo a un símbolo transmitido.
 * 
 * @param {number} tx Componente en fase transmitida
 * @param {number} ty Componente en cuadratura transmitida
 * @param {number} sigma Desviación estándar del ruido por componente
 * @param {() => number} nextGaussian Generador de ruido normal estándar N(0, 1)
 * @returns {{ x: number, y: number }} Coordenadas del símbolo recibido en el plano I/Q
 */
export function applyAWGN(tx, ty, sigma, nextGaussian) {
  return {
    x: tx + sigma * nextGaussian(),
    y: ty + sigma * nextGaussian()
  };
}
