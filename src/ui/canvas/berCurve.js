import { fitCanvas, getCssVar } from './common.js';
import { calculateTheoreticalBER } from '../../core/theory.js';
import { toSuperscript } from '../formatters.js';

const CURVE_DEFINITIONS = [
  { label: 'BPSK / QPSK', schemeKey: 'QPSK', colorVar: '--curve-qpsk', fallbackColor: '#0e7c86' },
  { label: '8-PSK', schemeKey: '8-PSK', colorVar: '--curve-psk8', fallbackColor: '#4f8f2f' },
  { label: '16-QAM', schemeKey: '16-QAM', colorVar: '--curve-qam16', fallbackColor: '#d97706' },
  { label: '64-QAM', schemeKey: '64-QAM', colorVar: '--curve-qam64', fallbackColor: '#8b3fc4' }
];

/**
 * Dibuja las curvas teóricas de BER contra Eb/N0 y superpone el punto de simulación actual.
 * 
 * @param {HTMLCanvasElement} canvas Elemento canvas
 * @param {object} simulationResult Resultado devuelto por simulate(...)
 */
export function drawBERCurve(canvas, simulationResult) {
  if (!canvas || !simulationResult) return;

  const { w, h, ctx } = fitCanvas(canvas);
  const left = 46;
  const right = 10;
  const top = 10;
  const bottom = 34;

  const g = simulationResult.ebn0dB;
  const th = calculateTheoreticalBER(simulationResult.scheme, g);

  // Mapeo lineal en X: [0 dB, 20 dB]
  const scaleX = v => left + (v / 20) * (w - left - right);

  // Mapeo logarítmico en Y: [10^0, 10^-6]
  const scaleY = p => {
    const clampedP = Math.max(p, 1e-6);
    return top + (-Math.log10(clampedP) / 6) * (h - top - bottom);
  };

  ctx.clearRect(0, 0, w, h);
  ctx.font = '11px sans-serif';
  ctx.lineWidth = 1;

  // 1. Rejilla horizontal logarítmica (décadas)
  for (let exp = 0; exp <= 6; exp++) {
    const yPos = scaleY(Math.pow(10, -exp));
    ctx.strokeStyle = getCssVar('--grid');
    ctx.beginPath();
    ctx.moveTo(left, yPos);
    ctx.lineTo(w - right, yPos);
    ctx.stroke();

    ctx.fillStyle = getCssVar('--mut');
    ctx.fillText(`10${toSuperscript(-exp)}`, 4, yPos + 4);
  }

  // 2. Rejilla vertical lineal (Eb/N0 de 0 a 20 dB)
  for (let v = 0; v <= 20; v += 5) {
    const xPos = scaleX(v);
    ctx.strokeStyle = getCssVar('--grid');
    ctx.beginPath();
    ctx.moveTo(xPos, top);
    ctx.lineTo(xPos, h - bottom);
    ctx.stroke();

    ctx.fillStyle = getCssVar('--mut');
    ctx.fillText(String(v), xPos - 5, h - bottom + 14);
  }

  // Etiqueta del eje X
  ctx.fillStyle = getCssVar('--mut');
  ctx.fillText('Eb/N0 (dB)', w / 2 - 28, h - 6);

  // 3. Trazado de las curvas teóricas
  const currentModName = simulationResult.scheme.name;
  const activeKey = currentModName === 'BPSK' ? 'QPSK' : currentModName;

  CURVE_DEFINITIONS.forEach((curve, i) => {
    const isSelected = curve.schemeKey === activeKey;
    const curveColor = getCssVar(curve.colorVar) || curve.fallbackColor;

    ctx.strokeStyle = curveColor;
    ctx.lineWidth = isSelected ? 3 : 1.3;
    ctx.globalAlpha = isSelected ? 1.0 : 0.55;

    ctx.beginPath();
    for (let v = 0; v <= 20; v += 0.25) {
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

    // Leyenda de curvas
    ctx.fillStyle = curveColor;
    ctx.fillText(curve.label, left + 8, h - bottom - 8 - (3 - i) * 14);
  });

  // 4. Marcador vertical punteado del Eb/N0 actual
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = getCssVar('--tx');
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(scaleX(g), top);
  ctx.lineTo(scaleX(g), h - bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  // 5. Marcador del punto teórico actual
  ctx.fillStyle = getCssVar('--tx');
  ctx.beginPath();
  ctx.arc(scaleX(g), scaleY(th), 5, 0, 2 * Math.PI);
  ctx.fill();

  // 6. Marcador del resultado simulado empírico
  const simulatedBER = simulationResult.berSim;
  if (simulatedBER > 0) {
    ctx.strokeStyle = getCssVar('--er');
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(scaleX(g), scaleY(simulatedBER), 8, 0, 2 * Math.PI);
    ctx.stroke();
  } else {
    ctx.fillStyle = getCssVar('--er');
    ctx.fillText('0 errores', scaleX(g) + 8, h - bottom - 6);
  }
}
