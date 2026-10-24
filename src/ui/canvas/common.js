/**
 * Utilidades compartidas para renderizado en Canvas con alta definición (DPI scaling).
 */

/**
 * Obtiene el valor computado de una variable CSS.
 * @param {string} varName Nombre de la variable (ej. '--bg', '--ac')
 * @returns {string}
 */
export function getCssVar(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Ajusta la resolución del canvas según el DPR (Device Pixel Ratio) de la pantalla.
 * @param {HTMLCanvasElement} canvas
 * @returns {{ w: number, h: number, ctx: CanvasRenderingContext2D }}
 */
export function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    w: rect.width,
    h: rect.height,
    ctx
  };
}
