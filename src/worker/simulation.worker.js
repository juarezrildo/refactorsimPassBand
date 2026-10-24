import { simulate } from '../core/simulate.js';

self.addEventListener('message', event => {
  const { id, params } = event.data;
  try {
    const result = simulate(params);
    // Para pasar los datos de forma serializable (sin instancias de clase ni métodos)
    self.postMessage({
      id,
      success: true,
      result: {
        scheme: {
          name: result.scheme.name,
          M: result.scheme.M,
          k: result.scheme.k,
          points: result.scheme.points
        },
        ebn0dB: result.ebn0dB,
        nSymbols: result.nSymbols,
        seed: result.seed,
        bits: result.bits,
        be: result.be,
        se: result.se,
        berSim: result.berSim,
        serSim: result.serSim,
        dots: result.dots
      }
    });
  } catch (err) {
    self.postMessage({
      id,
      success: false,
      error: err.message
    });
  }
});
