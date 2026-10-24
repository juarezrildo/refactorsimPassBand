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
  msg: $('msg'),
  themeToggle: $('theme-toggle'),
  segmentedButtons: document.querySelectorAll('.segmented-btn')
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

/**
 * Actualiza el relleno visual de las barras de desplazamiento (Sliders)
 */
function updateSliderProgress(slider) {
  if (!slider) return;
  const min = +slider.min || 0;
  const max = +slider.max || 100;
  const val = +slider.value;
  const percent = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, var(--ac) 0%, var(--ac) ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`;
}

/**
 * Sincroniza los botones de selección rápida de modulación (Segmented Control)
 */
function syncSegmentedControl(selectedMod) {
  elements.segmentedButtons.forEach(btn => {
    if (btn.dataset.mod === selectedMod) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function updateSimulation() {
  const state = readUIState();

  // Actualizar valores numéricos adyacentes a sliders
  elements.snrv.textContent = `${state.snr} dB`;
  elements.alv.textContent = state.al.toFixed(2);

  updateSliderProgress(elements.snr);
  updateSliderProgress(elements.al);
  syncSegmentedControl(state.mod);

  try {
    const result = await runSimulationAsync({
      modulation: state.mod,
      ebn0dB: state.snr,
      nSymbols: state.n,
      seed: state.sd
    });

    lastSimulationResult = result;

    // Renderizado reactivo fluido con requestAnimationFrame
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

// Generar nueva semilla pseudoaleatoria
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

// Alternar tema claro / oscuro
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  redrawOnly();
}

// Listeners de controles de entrada
['mod', 'snr', 'n', 'rb', 'al', 'fs', 'fu', 'sd'].forEach(id => {
  elements[id]?.addEventListener('input', updateSimulation);
});

// Eventos de botones de selección de modulación (Segmented Pills)
elements.segmentedButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const mod = btn.dataset.mod;
    if (mod && elements.mod.value !== mod) {
      elements.mod.value = mod;
      updateSimulation();
    }
  });
});

elements.re?.addEventListener('click', regenerateNoise);
elements.themeToggle?.addEventListener('click', toggleTheme);

window.addEventListener('resize', redrawOnly);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawOnly);

// Inicialización inicial
updateSliderProgress(elements.snr);
updateSliderProgress(elements.al);
updateSimulation();
