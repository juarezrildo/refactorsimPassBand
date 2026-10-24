import { fitCanvas, getCssVar } from './common.js';

/**
 * Renderiza el diagrama de constelación en el plano complejo I/Q con estilo Pro Max.
 * 
 * @param {HTMLCanvasElement} canvas Elemento canvas
 * @param {object} simulationResult Resultado devuelto por simulate(...)
 */
export function drawConstellation(canvas, simulationResult) {
  if (!canvas || !simulationResult) return;

  const { w, h, ctx } = fitCanvas(canvas);
  const R = 1.6; // Escala máxima visible en el plano normalizado
  const sx = v => w / 2 + (v / R) * (w / 2);
  const sy = v => h / 2 - (v / R) * (h / 2);

  const canvasBg = getCssVar('--canvas-bg') || '#080c10';
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, w, h);

  // 1. Círculo guía de energía unitaria Es = 1 (radio = 1)
  const unitRadius = (1 / R) * (w / 2);
  ctx.strokeStyle = getCssVar('--bd-subtle') || 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, unitRadius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Rejilla secundaria
  ctx.strokeStyle = getCssVar('--grid') || 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let v = -1; v <= 1; v += 0.5) {
    if (v === 0) continue; // Saltamos los ejes principales
    ctx.beginPath();
    ctx.moveTo(sx(v), 0);
    ctx.lineTo(sx(v), h);
    ctx.moveTo(0, sy(v));
    ctx.lineTo(w, sy(v));
    ctx.stroke();
  }

  // 3. Ejes principales I y Q
  ctx.strokeStyle = getCssVar('--grid-axis') || 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sx(0), 0);
  ctx.lineTo(sx(0), h);
  ctx.moveTo(0, sy(0));
  ctx.lineTo(w, sy(0));
  ctx.stroke();

  // Etiquetas de ejes con estilo tipográfico nítido
  ctx.fillStyle = getCssVar('--tx-secondary') || '#9db2be';
  ctx.font = '600 12px var(--font-sans), sans-serif';
  ctx.fillText('I', w - 16, sy(0) - 7);
  ctx.fillText('Q', sx(0) + 7, 16);

  // 4. Muestras recibidas con ruido (Buffer de puntos)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();

  const colorErr = getCssVar('--er') || '#ff4766';
  const colorOk = getCssVar('--ac') || '#00d2df';

  // Dibujamos primero los puntos correctos
  for (const d of simulationResult.dots) {
    if (!d.e) {
      ctx.fillStyle = colorOk;
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      ctx.arc(sx(d.x), sy(d.y), 2.2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Dibujamos encima los puntos con error para resaltarlos claramente
  for (const d of simulationResult.dots) {
    if (d.e) {
      ctx.fillStyle = colorErr;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(sx(d.x), sy(d.y), 3.0, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;

  // 5. Centros ideales de la constelación
  const scheme = simulationResult.scheme;
  const textColor = getCssVar('--tx') || '#fff';

  for (const q of scheme.points) {
    const qx = sx(q.x);
    const qy = sy(q.y);

    // Círculo exterior
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(qx, qy, 5.5, 0, 2 * Math.PI);
    ctx.stroke();

    // Punto central
    ctx.fillStyle = getCssVar('--ac') || '#00d2df';
    ctx.beginPath();
    ctx.arc(qx, qy, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Etiqueta binaria (solo si M <= 16 para evitar empaste visual)
    if (scheme.M <= 16) {
      const bitLabel = q.l.toString(2).padStart(scheme.k, '0');
      ctx.font = '700 11px var(--font-mono), monospace';

      // Sombra de fondo para legibilidad
      ctx.fillStyle = 'rgba(8, 12, 16, 0.75)';
      ctx.fillRect(qx + 6, qy - 17, bitLabel.length * 7 + 4, 13);

      ctx.fillStyle = textColor;
      ctx.fillText(bitLabel, qx + 8, qy - 7);
    }
  }
}
