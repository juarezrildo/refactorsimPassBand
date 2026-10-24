import { runSimulationAsync } from './simulationService.js';
import { drawConstellation } from './canvas/constellation.js';
import { drawBERCurve } from './canvas/berCurve.js';
import { renderMetrics } from './metricsRenderer.js';

// Elementos DOM
const $ = id => document.getElementById(id);

const elements = {
  mod: $('mod'),
  snr: $('snr'),
  snrv: $('snrv'),
  n: $('n'),
  rb: $('rb'),
  al: $('al'),
  alv: $('alv'),
  fs: $('fs'),
  fu: $('fu'),
  sd: $('sd'),
  re: $('re'),
  cc: $('cc'),
  cb: $('cb'),
  mt: $('mt'),
  msg: $('msg')
};

let lastSimulationResult = null;
let animationFrameId = null;

function readUIState() {
  return {
    mod: elements.mod.value,
    snr: +elements.snr.value,
    n: +elements.n.value,
    rb: +elements.rb.value,
    al: +elements.al.value,
    fs: +elements.fs.value || 0,
    fu: +elements.fu.value,
    sd: +elements.sd.value || 1
  };
}

async function updateSimulation() {
  const state = readUIState();

  // Actualizar valores numéricos adyacentes a sliders
  elements.snrv.textContent = state.snr;
  elements.alv.textContent = state.al.toFixed(2);

  try {
    const result = await runSimulationAsync({
      modulation: state.mod,
      ebn0dB: state.snr,
      nSymbols: state.n,
      seed: state.sd
    });

    lastSimulationResult = result;

    // Renderizado sincronizado con el refresco de pantalla
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
      drawConstellation(elements.cc, result);
      drawBERCurve(elements.cb, result);
      renderMetrics(elements.mt, elements.msg, result, state);
    });
  } catch (err) {
    console.error('Error durante la simulación:', err);
  }
}

// Generar nueva semilla aleatoria
function regenerateNoise() {
  elements.sd.value = Math.floor(Math.random() * 99999) + 1;
  updateSimulation();
}

// Redibujar gráficos sin re-simular (para cambios de tamaño de ventana o tema)
function redrawOnly() {
  if (lastSimulationResult) {
    drawConstellation(elements.cc, lastSimulationResult);
    drawBERCurve(elements.cb, lastSimulationResult);
  }
}

// Listeners
['mod', 'snr', 'n', 'rb', 'al', 'fs', 'fu', 'sd'].forEach(id => {
  elements[id]?.addEventListener('input', updateSimulation);
});

elements.re?.addEventListener('click', regenerateNoise);

window.addEventListener('resize', redrawOnly);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawOnly);

// Inicialización
updateSimulation();
