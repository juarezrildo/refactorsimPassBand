# Simulador de modulaciones digitales paso banda — Refactorización profesional

## Contexto
- Proyecto de Rildo Jimmy Juarez Romero (UPDS, Comunicaciones Digitales I, RED-0310).
- Base: `original/Simulador_de_modulaciones_digitales_paso_banda_v1.html`, archivo único del docente (HTML + CSS + JS, sin dependencias).
- Objetivo: convertirlo en la base de un simulador profesional, optimizando el código y el uso de recursos del navegador, sin cambiar los resultados de la v1.
- Idioma del proyecto: español (interfaz, comentarios, commits y documentación).

## Regla de oro
**La v1.1 debe dar exactamente los mismos números que el original con la misma semilla.**
- Nunca modificar `original/`. Es la referencia para las pruebas doradas.
- Antes de refactorizar, generar `tests/golden/v1.json` ejecutando el motor original (sin DOM) para:
  BPSK, QPSK, 8-PSK, 16-QAM y 64-QAM × Eb/N0 ∈ {0, 4, 6, 8, 10, 14, 16, 20} dB × N ∈ {1000, 20000, 100000} × semillas {1, 2, 3}.
  Guardar errores de bit, errores de símbolo, BER teórica y Eb/N0 para BER 10⁻⁵.
- Cualquier cambio que consuma el generador aleatorio en otro orden (Box-Muller con ambas salidas, otro PRNG, etc.) cambia los resultados: va en la **v2**, con su propio archivo dorado y documentado en `CHANGELOG.md`.

### Valores de control (semilla 1, 100 000 símbolos)
| Caso | Errores de bit esperados |
|---|---|
| QPSK, 6 dB | 500 de 200 000 |
| 8-PSK, 10 dB | 303 de 300 000 |
| 16-QAM, 10 dB | 726 de 400 000 |
| 64-QAM, 14 dB | 1290 de 600 000 |
| BPSK, 10 dB | 0 de 100 000 |

## Modelo físico (no cambiar sin justificar)
- Canal AWGN en banda base equivalente compleja; detección coherente ideal; detector ML (mínima distancia); mapeo Gray.
- Energía media por símbolo Es = 1; Eb = 1/k; σ por dimensión = √(Eb / (2·Eb/N0)).
- QPSK desfasada π/4; 8-PSK sin desfase; QAM cuadrada con etiqueta `(gray(i) << k/2) | gray(j)`.
- BER teórica: exacta para BPSK/QPSK, Q(√(2Eb/N0)); aproximaciones estándar para 8-PSK y M-QAM.
- Ancho de banda paso banda B = (1 + α)·Rs; eficiencia η = k / (1 + α).
- Archivo: 1 MB = 10⁶ bytes (decimal).
- La constelación dibuja solo los primeros 2000 símbolos; la BER usa todos.

## Arquitectura objetivo
```
original/            referencia del docente (solo lectura)
src/core/            núcleo puro: sin DOM, sin variables globales
  rng.js             mulberry32 con semilla, inyectado como dependencia
  gaussian.js        Box-Muller (v1.1: idéntico al original)
  special.js         erfc, Q
  modulations/       una estrategia por modulación: { name, M, k, constellation(), detect(x, y), berTheory(ebn0dB) }
  registry.js        registro de modulaciones (abierto/cerrado: agregar sin tocar el resto)
  channel.js         AWGN (luego desvanecimiento y ruido de fase)
  simulate.js        simulate({ modulation, ebn0dB, nSymbols, seed }) → resultado inmutable
  theory.js          berTheory, requiredEbN0 (búsqueda binaria)
  link.js            Rs, B, eficiencia, bits, símbolos y tiempo de un archivo
src/worker/          ejecuta simulate fuera del hilo principal
src/ui/              estado único, controles, render en canvas, formato con coma decimal
tests/               unitarias, estadísticas y regresión dorada
dist/                build de un solo archivo HTML (la plataforma del docente usa un archivo)
```

## Principios
- Separación de responsabilidades: el núcleo no conoce el DOM; la UI no hace cálculos físicos.
- Patrón Strategy + registro para las modulaciones.
- Inyección de dependencias (RNG como parámetro), funciones puras y resultados inmutables.
- Estado único y flujo unidireccional: `state → compute(state) → render(result)`.
- Reproducibilidad: toda exportación incluye parámetros, semilla y versión.

## Optimizaciones previstas
### v1.1 (resultados idénticos)
- [ ] Extraer el núcleo a módulos ES y generar las pruebas doradas.
- [ ] Detector O(1) por ejes en QAM (verificado: 0 decisiones distintas frente a la fuerza bruta en 200 000 símbolos).
- [ ] Detector por sector angular en PSK, validado contra las pruebas doradas.
- [ ] Debounce / `requestAnimationFrame` en los controles.
- [ ] Web Worker para `simulate`.
- [ ] `Float32Array` / `Uint8Array` para los puntos dibujados en lugar de objetos `{x, y, e}`.
- [ ] Caché de constelaciones y curvas teóricas.
- [ ] Corregir detalles: condición redundante `name==='QAM'||…`, formateo de unidades con `.replace`, `innerHTML` concatenado.
- [ ] Medir antes y después (tiempo por `update`, memoria) y registrar en `docs/benchmarks.md`.
  Referencia inicial en Node: 64-QAM, 100 000 símbolos ≈ 27 ms.

### v2 (cambia números, se documenta)
- Box-Muller con ambas salidas; intervalos de confianza de la BER; modo "simular hasta N errores"; barrido automático de Eb/N0; exportación CSV/JSON; función Q más precisa.

### v3
- Desvanecimiento Rayleigh/Rician, ruido de fase, pulso coseno alzado real con espectro y diagrama de ojo, codificación de canal.

## Pruebas
- Unitarias: energía media de cada constelación = 1; vecinos difieren en 1 bit (Gray); Q(0) = 0,5; Rs, B y η con valores conocidos.
- Estadísticas: la BER simulada cae en el intervalo de confianza de la teórica cuando hay ≥ 100 errores.
- Regresión dorada: igualdad exacta con `tests/golden/v1.json`.
- Herramientas previstas: Node ≥ 20, Vitest. Build de archivo único con Vite + `vite-plugin-singlefile`.

## Comandos (a definir al crear `package.json`)
- `npm test` — todas las pruebas
- `npm run golden` — regenerar los archivos dorados desde `original/` (solo cuando se apruebe)
- `npm run dev` — servidor local
- `npm run build` — genera `dist/simulador.html`

## Definición de terminado
1. Todas las pruebas pasan, incluida la regresión dorada.
2. Benchmark registrado con mejora medida.
3. La interfaz se ve y responde igual que la v1 (misma disposición y mismos controles).
4. `dist/simulador.html` funciona abierto directamente desde el disco, sin servidor.

## Uso de IA
- La refactorización se hace con apoyo de Claude. Registrar en `docs/ia.md` qué se hizo con apoyo de IA y cómo se verificó.
