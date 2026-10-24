/**
 * Generador de variables aleatorias normales estándar N(0, 1) vía Box-Muller.
 * 
 * NOTA DE REGLA DE ORO (v1.1):
 * Para mantener la compatibilidad numérica exacta con la v1, se consumen dos números
 * aleatorios por muestra (uno para el radio y uno para el coseno), descartando el seno.
 * En la v2 se optimizará guardando la segunda salida del par cartesiano.
 * 
 * @param {() => number} rnd Generador uniforme en [0, 1)
 * @returns {() => number} Función que retorna una muestra con distribución N(0, 1)
 */
export function createGaussian(rnd) {
  return function nextGaussian() {
    return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  };
}
