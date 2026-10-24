import { registry } from './registry.js';
import { createRNG } from './rng.js';
import { createGaussian } from './gaussian.js';
import { calculateNoiseSigma } from './channel.js';
import { popCount } from './utils.js';

/**
 * Ejecuta una simulación Monte Carlo pura para un esquema de modulación sobre canal AWGN.
 * 
 * @param {object} params
 * @param {string | object} params.modulation Nombre del esquema o instancia registrada
 * @param {number} params.ebn0dB Relación Eb/N0 en dB
 * @param {number} params.nSymbols Número total de símbolos a transmitir (N)
 * @param {number} [params.seed=1] Semilla para reproducibilidad
 * @param {number} [params.maxDots=2000] Cantidad máxima de símbolos recibidos a guardar para visualización
 * @returns {object} Resultado inmutable de la simulación
 */
export function simulate({ modulation, ebn0dB, nSymbols, seed = 1, maxDots = 2000 }) {
  const scheme = typeof modulation === 'string' ? registry.get(modulation) : modulation;
  const rnd = createRNG(seed);
  const gauss = createGaussian(rnd);

  const M = scheme.M;
  const k = scheme.k;
  const points = scheme.points;
  const sigma = calculateNoiseSigma(k, ebn0dB);

  let bitErrors = 0;
  let symbolErrors = 0;
  const dots = [];

  const dotsLimit = Math.min(nSymbols, maxDots);

  for (let n = 0; n < nSymbols; n++) {
    // 1. Selección aleatoria del símbolo transmitido
    const transmittedIndex = (rnd() * M) | 0;
    const txPoint = points[transmittedIndex];

    // 2. Paso por canal AWGN (consumo de Box-Muller exactamente igual al original)
    const rxX = txPoint.x + sigma * gauss();
    const rxY = txPoint.y + sigma * gauss();

    // 3. Decisión por mínima distancia (ML)
    const detectedPoint = scheme.detect(rxX, rxY);

    // 4. Conteo de errores
    const bitErr = popCount(detectedPoint.l ^ txPoint.l);
    bitErrors += bitErr;
    if (bitErr > 0) {
      symbolErrors++;
    }

    // 5. Muestra para diagrama de constelación
    if (n < dotsLimit) {
      dots.push({
        x: rxX,
        y: rxY,
        e: bitErr > 0
      });
    }
  }

  const totalBits = nSymbols * k;

  return Object.freeze({
    scheme,
    ebn0dB,
    nSymbols,
    seed,
    bits: totalBits,
    be: bitErrors,
    se: symbolErrors,
    berSim: totalBits > 0 ? bitErrors / totalBits : 0,
    serSim: nSymbols > 0 ? symbolErrors / nSymbols : 0,
    dots
  });
}
