import { simulate } from '../core/simulate.js';

let worker = null;
let currentRequestId = 0;
let pendingResolvers = new Map();

function initWorker() {
  if (typeof Worker !== 'undefined') {
    try {
      worker = new Worker(new URL('../worker/simulation.worker.js', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = event => {
        const { id, success, result, error } = event.data;
        const resolver = pendingResolvers.get(id);
        if (resolver) {
          pendingResolvers.delete(id);
          if (success) {
            resolver.resolve(result);
          } else {
            resolver.reject(new Error(error));
          }
        }
      };

      worker.onerror = err => {
        console.warn('Worker error, fallback to main thread:', err);
        worker = null;
      };
    } catch (e) {
      console.warn('No fue posible instanciar Web Worker, utilizando hilo principal:', e);
      worker = null;
    }
  }
}

initWorker();

/**
 * Ejecuta la simulación de forma asíncrona mediante Web Worker (o fallback síncrono).
 * Cancela automáticamente solicitudes obsoletas para no procesar ráfagas de sliders.
 * 
 * @param {object} params
 * @returns {Promise<object>}
 */
export function runSimulationAsync(params) {
  currentRequestId++;
  const reqId = currentRequestId;

  return new Promise((resolve, reject) => {
    // Si hay un worker disponible, delegar el cómputo
    if (worker) {
      pendingResolvers.set(reqId, {
        resolve: result => {
          // Si llegó una solicitud más reciente, descartar esta
          if (reqId === currentRequestId) {
            resolve(result);
          }
        },
        reject
      });

      worker.postMessage({ id: reqId, params });
    } else {
      // Fallback en hilo principal
      try {
        const result = simulate(params);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }
  });
}
