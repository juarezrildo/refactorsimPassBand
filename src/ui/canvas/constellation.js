import { fitCanvas, getCssVar } from './common.js';

/**
 * Dibuja el diagrama de constelación en el plano I/Q.
 * 
 * @param {HTMLCanvasElement} canvas Elemento canvas
 * @param {object} simulationResult Resultado devuelto por simulate(...)
 */
export function drawConstellation(canvas, simulationResult) {
  if (!canvas || !simulationResult) return;

  const { w, h, ctx } = fitCanvas(canvas);
  const R = 1.5; // Escala máxima visible en el plano normalizado
  const sx = v => w / 2 + (v / R) * (w / 2);
  const sy = v => h / 2 - (v / R) * (h / 2);

  ctx.clearRect(0, 0, w, h);

  // 1. Rejilla secundaria
  ctx.strokeStyle = getCssVar('--grid');
  ctx.lineWidth = 1;
  for (let v = -1; v <= 1; v += 0.5) {
    ctx.beginPath();
    ctx.moveTo(sx(v), 0);
    ctx.lineTo(sx(v), h);
    ctx.moveTo(0, sy(v));
    ctx.lineTo(w, sy(v));
    ctx.stroke();
  }

  // 2. Ejes principales I y Q
  ctx.strokeStyle = getCssVar('--mut');
  ctx.beginPath();
  ctx.moveTo(sx(0), 0);
  ctx.lineTo(sx(0), h);
  ctx.moveTo(0, sy(0));
  ctx.lineTo(w, sy(0));
  ctx.stroke();

  ctx.fillStyle = getCssVar('--mut');
  ctx.font = '12px sans-serif';
  ctx.fillText('I', w - 14, sy(0) - 6);
  ctx.fillText('Q', sx(0) + 6, 14);

  // 3. Muestras recibidas con ruido
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();

  const colorErr = getCssVar('--er');
  const colorOk = getCssVar('--ac');

  for (const d of simulationResult.dots) {
    ctx.fillStyle = d.e ? colorErr : colorOk;
    ctx.globalAlpha = d.e ? 0.9 : 0.4;
    ctx.beginPath();
    ctx.arc(sx(d.x), sy(d.y), d.e ? 2.8 : 2.2, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1.0;

  // 4. Puntos ideales de la constelación y etiquetas de bits
  const scheme = simulationResult.scheme;
  ctx.strokeStyle = getCssVar('--tx');
  ctx.lineWidth = 1.5;
  ctx.fillStyle = getCssVar('--tx');
  ctx.font = '11px sans-serif';

  for (const q of scheme.points) {
    ctx.beginPath();
    ctx.arc(sx(q.x), sy(q.y), 5, 0, 2 * Math.PI);
    ctx.stroke();

    if (scheme.M <= 16) {
      const bitLabel = q.l.toString(2).padStart(scheme.k, '0');
      ctx.fillText(bitLabel, sx(q.x) + 7, sy(q.y) - 7);
    }
  }
}
