import { fitCanvas, getCssVar } from './common.js';
import { calculateTheoreticalBER } from '../../core/theory.js';
import { toSuperscript } from '../formatters.js';

const CURVE_DEFINITIONS = [
  { label: 'BPSK / QPSK', schemeKey: 'QPSK', colorVar: '--curve-qpsk', fallbackColor: '#00d2df' },
  { label: '8-PSK', schemeKey: '8-PSK', colorVar: '--curve-psk8', fallbackColor: '#10b981' },
  { label: '16-QAM', schemeKey: '16-QAM', colorVar: '--curve-qam16', fallbackColor: '#f59e0b' },
  { label: '64-QAM', schemeKey: '64-QAM', colorVar: '--curve-qam64', fallbackColor: '#a855f7' }
];

/**
 * Renderiza las curvas analíticas de BER y el punto de operación simulado con estilo Pro Max.
 * 
 * @param {HTMLCanvasElement} canvas Elemento canvas
 * @param {object} simulationResult Resultado devuelto por simulate(...)
 */
export function drawBERCurve(canvas, simulationResult) {
  if (!canvas || !simulationResult) return;

  const { w, h, ctx } = fitCanvas(canvas);
  const left = 50;
  const right = 16;
  const top = 16;
  const bottom = 36;

  const g = simulationResult.ebn0dB;
  const th = calculateTheoreticalBER(simulationResult.scheme, g);

  // Mapeo lineal en X: [0 dB, 20 dB]
  const scaleX = v => left + (v / 20) * (w - left - right);

  // Mapeo logarítmico en Y: [10^0, 10^-6]
  const scaleY = p => {
    const clampedP = Math.max(p, 1e-6);
    return top + (-Math.log10(clampedP) / 6) * (h - top - bottom);
  };

  const canvasBg = getCssVar('--canvas-bg') || '#080c10';
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, w, h);

  // 1. Rejilla horizontal logarítmica (décadas 10^0 a 10^-6)
  for (let exp = 0; exp <= 6; exp++) {
    const yPos = scaleY(Math.pow(10, -exp));
    ctx.strokeStyle = getCssVar('--grid') || 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, yPos);
    ctx.lineTo(w - right, yPos);
    ctx.stroke();

    ctx.fillStyle = getCssVar('--tx-muted') || '#5e7685';
    ctx.font = '600 11px var(--font-mono), monospace';
    ctx.fillText(`10${toSuperscript(-exp)}`, 6, yPos + 4);
  }

  // 2. Rejilla vertical lineal (Eb/N0 de 0 a 20 dB)
  for (let v = 0; v <= 20; v += 5) {
    const xPos = scaleX(v);
    ctx.strokeStyle = getCssVar('--grid') || 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPos, top);
    ctx.lineTo(xPos, h - bottom);
    ctx.stroke();

    ctx.fillStyle = getCssVar('--tx-muted') || '#5e7685';
    ctx.font = '600 11px var(--font-mono), monospace';
    ctx.fillText(String(v), xPos - 6, h - bottom + 16);
  }

  // Etiqueta del eje X
  ctx.fillStyle = getCssVar('--tx-secondary') || '#9db2be';
  ctx.font = '600 11px var(--font-sans), sans-serif';
  ctx.fillText('Eb/N0 (dB)', w / 2 - 28, h - 6);

  // 3. Trazado de las curvas teóricas
  const currentModName = simulationResult.scheme.name;
  const activeKey = currentModName === 'BPSK' ? 'QPSK' : currentModName;

  CURVE_DEFINITIONS.forEach((curve, i) => {
    const isSelected = curve.schemeKey === activeKey;
    const curveColor = getCssVar(curve.colorVar) || curve.fallbackColor;

    ctx.strokeStyle = curveColor;
    ctx.lineWidth = isSelected ? 3.5 : 1.5;
    ctx.globalAlpha = isSelected ? 1.0 : 0.45;

    ctx.beginPath();
    for (let v = 0; v <= 20; v += 0.2) {
      const p = calculateTheoreticalBER(curve.schemeKey, v);
      if (p < 1e-6) {
        ctx.lineTo(scaleX(v), scaleY(1e-6));
        break;
      }
      if (v === 0) {
        ctx.moveTo(scaleX(v), scaleY(p));
      } else {
        ctx.lineTo(scaleX(v), scaleY(p));
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Leyenda de curvas en la esquina inferior izquierda
    ctx.fillStyle = curveColor;
    ctx.font = isSelected ? '700 11px var(--font-sans), sans-serif' : '500 11px var(--font-sans), sans-serif';
    ctx.fillText(curve.label, left + 10, h - bottom - 10 - (3 - i) * 16);
  });

  // 4. Guía vertical punteada en el Eb/N0 actual
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = getCssVar('--tx-secondary') || 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(scaleX(g), top);
  ctx.lineTo(scaleX(g), h - bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  // 5. Punto teórico actual (Círculo sólido)
  ctx.fillStyle = getCssVar('--tx') || '#fff';
  ctx.beginPath();
  ctx.arc(scaleX(g), scaleY(th), 5, 0, 2 * Math.PI);
  ctx.fill();

  // 6. Punto empírico simulado
  const simulatedBER = simulationResult.berSim;
  if (simulatedBER > 0) {
    const errColor = getCssVar('--er') || '#ff4766';
    // Anillo exterior
    ctx.strokeStyle = errColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(scaleX(g), scaleY(simulatedBER), 8, 0, 2 * Math.PI);
    ctx.stroke();

    // Punto central
    ctx.fillStyle = errColor;
    ctx.beginPath();
    ctx.arc(scaleX(g), scaleY(simulatedBER), 3, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    // Indicador de 0 errores
    const okColor = getCssVar('--ok') || '#10b981';
    ctx.fillStyle = okColor;
    ctx.font = '700 11px var(--font-mono), monospace';
    ctx.fillText('0 errores (BER < 10⁻⁵)', scaleX(g) + 8, h - bottom - 8);
  }
}
