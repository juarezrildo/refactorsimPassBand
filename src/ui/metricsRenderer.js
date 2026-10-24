import {
  formatRate,
  formatScientific,
  formatNumber,
  formatDuration
} from './formatters.js';
import { calculateTheoreticalBER, calculateRequiredEbN0 } from '../core/theory.js';
import { calculateLinkBudget } from '../core/link.js';

/**
 * Renderiza la grilla de métricas de enlace y el mensaje explicativo.
 * 
 * @param {HTMLElement} metricsContainer Contenedor de las tarjetas de métricas (#mt)
 * @param {HTMLElement} messageElement Elemento para el párrafo explicativo (#msg)
 * @param {object} simulationResult Resultado de simulate(...)
 * @param {object} uiParams Parámetros ingresados por el usuario
 */
export function renderMetrics(metricsContainer, messageElement, simulationResult, uiParams) {
  const scheme = simulationResult.scheme;
  const k = scheme.k;
  const g = simulationResult.ebn0dB;
  const bitRate = uiParams.rb * 1e3;
  const rollOff = uiParams.al;
  const fileBytes = uiParams.fs * uiParams.fu;

  const link = calculateLinkBudget({
    k,
    bitRate,
    rollOff,
    ebn0dB: g,
    fileBytes
  });

  const berTheory = calculateTheoreticalBER(scheme, g);
  const requiredEbN0 = calculateRequiredEbN0(scheme, 1e-5);
  const serPercent = ((100 * simulationResult.se) / simulationResult.nSymbols).toFixed(2);

  const cards = [
    { label: 'Bits por símbolo (k)', value: `${k}` },
    { label: 'Tasa de símbolos Rs', value: formatRate(link.symbolRate, 'symbols') },
    { label: 'Ancho de banda B', value: formatRate(link.bandwidth, 'hz') },
    { label: 'Eficiencia espectral', value: `${link.spectralEfficiency.toFixed(2)} bit/s/Hz` },
    { label: 'Es/N0', value: `${link.esn0dB.toFixed(1)} dB` },
    { label: 'BER teórica', value: formatScientific(berTheory) },
    {
      label: 'BER simulada',
      value: `${formatScientific(simulationResult.berSim)}<small>${simulationResult.be} errores en ${simulationResult.bits} bits</small>`
    },
    { label: 'Errores de símbolo', value: `${serPercent} %` },
    { label: 'Eb/N0 para BER 10⁻⁵', value: `${requiredEbN0.toFixed(1)} dB` },
    {
      label: 'Bits del archivo',
      value: `${formatNumber(link.fileBits)}<small>${formatNumber(fileBytes)} bytes × 8</small>`
    },
    {
      label: 'Símbolos transmitidos',
      value: `${formatNumber(link.fileSymbols)}<small>bits ÷ k (con BPSK: ${formatNumber(link.fileBits)})</small>`
    },
    {
      label: 'Tiempo de transmisión',
      value: `${formatDuration(link.transmissionTimeSec)}<small>bits ÷ Rb</small>`
    }
  ];

  // Renderizado eficiente de las tarjetas
  const fragment = document.createDocumentFragment();
  for (const card of cards) {
    const cardEl = document.createElement('div');
    const labelEl = document.createElement('small');
    labelEl.textContent = card.label;
    const valueEl = document.createElement('b');
    valueEl.innerHTML = card.value;
    cardEl.appendChild(labelEl);
    cardEl.appendChild(valueEl);
    fragment.appendChild(cardEl);
  }

  metricsContainer.replaceChildren(fragment);

  // Generación del mensaje pedagógico explicativo
  let msg = `Con ${scheme.name} se envían ${k} bit${k > 1 ? 's' : ''} por símbolo y se necesita aproximadamente ${requiredEbN0.toFixed(1)} dB de Eb/N0 para llegar a BER 10⁻⁵. `;
  msg += g < requiredEbN0
    ? 'Estás por debajo de ese valor, por eso aparecen errores (puntos rojos).'
    : 'Estás por encima de ese valor: el enlace es fiable.';

  if (simulationResult.be === 0) {
    msg += ' No hubo errores en esta simulación; aumenta los símbolos o baja Eb/N0 para observarlos.';
  }
  msg += ` Para el archivo de ${formatNumber(fileBytes)} bytes se transmiten unos ${formatNumber(link.fileSymbols)} símbolos en ${formatDuration(link.transmissionTimeSec)}.`;
  msg += ' Prueba cambiar a 64-QAM: el ancho de banda baja, pero necesitas mucha más potencia.';

  messageElement.textContent = msg;
}
