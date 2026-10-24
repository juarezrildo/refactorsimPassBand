import {
  formatRate,
  formatScientific,
  formatNumber,
  formatDuration
} from './formatters.js';
import { calculateTheoreticalBER, calculateRequiredEbN0 } from '../core/theory.js';
import { calculateLinkBudget } from '../core/link.js';

/**
 * Renderiza la grilla de métricas de enlace y el panel de diagnóstico pedagógico con estilo Pro Max.
 * 
 * @param {HTMLElement} metricsContainer Contenedor de las tarjetas de métricas (#mt)
 * @param {HTMLElement} messageElement Elemento para el párrafo explicativo (#msg)
 * @param {object} simulationResult Resultado de simulate(...)
 * @param {object} uiParams Parámetros ingresados por el usuario
 */
export function renderMetrics(metricsContainer, messageElement, simulationResult, uiParams) {
  if (!metricsContainer || !messageElement || !simulationResult) return;

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
  const isReliable = g >= requiredEbN0;

  const cardsData = [
    {
      category: 'MODULACIÓN',
      label: 'Bits por símbolo (k)',
      value: `${k}`,
      sub: `M = ${scheme.M} símbolos`
    },
    {
      category: 'SEÑALIZACIÓN',
      label: 'Tasa de símbolos Rs',
      value: formatRate(link.symbolRate, 'symbols'),
      sub: 'Baudios = Rb ÷ k'
    },
    {
      category: 'ESPECTRO',
      label: 'Ancho de banda B',
      value: formatRate(link.bandwidth, 'hz'),
      sub: `Nyquist con α = ${rollOff.toFixed(2)}`
    },
    {
      category: 'EFICIENCIA',
      label: 'Eficiencia espectral',
      value: `${link.spectralEfficiency.toFixed(2)}`,
      sub: 'bit/s / Hz = k ÷ (1 + α)'
    },
    {
      category: 'ENERGÍA',
      label: 'Relación Es/N0',
      value: `${link.esn0dB.toFixed(1)} dB`,
      sub: 'Eb/N0 + 10·log₁₀(k)'
    },
    {
      category: 'TEORÍA',
      label: 'BER teórica',
      value: formatScientific(berTheory),
      sub: 'Límite analítico AWGN'
    },
    {
      category: 'SIMULACIÓN',
      label: 'BER simulada',
      value: formatScientific(simulationResult.berSim),
      sub: `${formatNumber(simulationResult.be)} errs en ${formatNumber(simulationResult.bits)} bits`
    },
    {
      category: 'CALIDAD',
      label: 'Errores de símbolo',
      value: `${serPercent} %`,
      sub: `${formatNumber(simulationResult.se)} de ${formatNumber(simulationResult.nSymbols)} símb`
    },
    {
      category: 'CONSIGNACIÓN',
      label: 'Eb/N0 para BER 10⁻⁵',
      value: `${requiredEbN0.toFixed(1)} dB`,
      sub: 'Umbral de confiabilidad'
    },
    {
      category: 'ARCHIVO',
      label: 'Bits del archivo',
      value: formatNumber(link.fileBits),
      sub: `${formatNumber(fileBytes)} bytes × 8`
    },
    {
      category: 'TRANSMISIÓN',
      label: 'Símbolos a enviar',
      value: formatNumber(link.fileSymbols),
      sub: `bits ÷ k (con BPSK: ${formatNumber(link.fileBits)})`
    },
    {
      category: 'LATENCIA',
      label: 'Tiempo de transmisión',
      value: formatDuration(link.transmissionTimeSec),
      sub: 'Ideal sin overhead (bits ÷ Rb)'
    }
  ];

  // Construcción del deck de métricas
  const fragment = document.createDocumentFragment();
  for (const card of cardsData) {
    const cardEl = document.createElement('div');
    cardEl.className = 'metric-card';

    const labelContainer = document.createElement('div');
    labelContainer.className = 'metric-label';
    labelContainer.innerHTML = `<span>${card.label}</span><span style="font-size:0.68rem;opacity:0.7">${card.category}</span>`;

    const valueEl = document.createElement('div');
    valueEl.className = 'metric-value';
    valueEl.textContent = card.value;

    const subEl = document.createElement('small');
    subEl.className = 'metric-sub';
    subEl.textContent = card.sub;

    cardEl.appendChild(labelContainer);
    cardEl.appendChild(valueEl);
    cardEl.appendChild(subEl);
    fragment.appendChild(cardEl);
  }

  metricsContainer.replaceChildren(fragment);

  // Panel de Diagnóstico Pedagógico
  const statusIcon = isReliable ? '✓' : '⚠';
  const statusBadge = isReliable ? 'ENLACE FIABLE' : 'ENLACE DEGRADADO POR RUIDO';
  const statusClass = isReliable ? 'reliable' : 'degraded';

  messageElement.className = `glass-panel diagnostic-panel ${statusClass}`;

  let explanation = `<strong>[${statusBadge}]</strong> Con <strong>${scheme.name}</strong> se envían <strong>${k} bit${k > 1 ? 's' : ''}</strong> por símbolo y se requieren aproximadamente <strong>${requiredEbN0.toFixed(1)} dB</strong> de $E_b/N_0$ para asegurar una BER de $10^{-5}$. `;

  if (isReliable) {
    explanation += `La relación de señal actual (${g.toFixed(1)} dB) está <strong>por encima</strong> del umbral requerido: el canal opera en zona segura y libre de errores significativos.`;
  } else {
    explanation += `La relación actual (${g.toFixed(1)} dB) está <strong>por debajo</strong> de lo necesario: por eso la constelación muestra dispersión y aparecen puntos rojos de decisión errónea.`;
  }

  if (simulationResult.be === 0) {
    explanation += ' No se detectaron errores en esta muestra puntual; puedes aumentar el número de símbolos simulados o reducir el $E_b/N_0$ para visualizar la tasa empírica.';
  }

  explanation += ` Transmitir este archivo de ${formatNumber(fileBytes)} bytes requerirá <strong>${formatNumber(link.fileSymbols)} símbolos</strong> completándose en <strong>${formatDuration(link.transmissionTimeSec)}</strong>.`;

  messageElement.innerHTML = `
    <div class="diagnostic-icon" style="color: ${isReliable ? 'var(--ok)' : 'var(--er)'}">${statusIcon}</div>
    <div class="diagnostic-text">${explanation}</div>
  `;
}
