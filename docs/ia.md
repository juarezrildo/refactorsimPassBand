# Registro de Asistencia por IA

En este documento se registran los cambios arquitectónicos, optimizaciones y refactorizaciones realizadas con asistencia de IA en el proyecto **Simulador de modulaciones digitales paso banda**, así como los métodos de validación aplicados.

---

## [2026-10-24] - Paso 1 y Paso 2: Inicialización y Estructuración

### Acciones Realizadas
1. **Preservación del Original (Paso 1)**:
   - Se copió el archivo de referencia `Simulador de modulaciones digitales paso banda_v1.html` a la carpeta `original/Simulador_de_modulaciones_digitales_paso_banda_v1.html` en modo de solo lectura.
2. **Inicialización del Entorno (Paso 2)**:
   - Inicialización del repositorio Git en rama `main`.
   - Creación de `.gitignore` para aislar dependencias, builds y temporales.
   - Creación de `package.json` configurado como ES Modules (`type: "module"`) con scripts para desarrollo (`vite`), compilación y tests (`vitest`).
   - Creación de `vite.config.js`.
   - Estructuración de carpetas (`src/core`, `src/ui`, `src/worker`, `src/styles`, `tests`, `docs`).
   - Creación de `tests/golden/v1.json` con 360 escenarios de control.

### Métodos de Verificación
- Verificación de integridad del archivo copiado en `original/` (13 336 bytes).
- Validación de los 5 casos de control estipulados en `CLAUDE.md`.

---

## [2026-10-24] - Paso 3: Modularización del Núcleo Puro (`src/core/`)

### Acciones Realizadas
1. **Extracción modular**:
   - `src/core/special.js`: `erfc` y `Q(x)`.
   - `src/core/rng.js`: `createRNG(seed)` con algoritmo Mulberry32.
   - `src/core/gaussian.js`: Box-Muller determinista compatible con v1.
   - `src/core/utils.js`: `popCount`, `grayEncode`, `hammingDistance`.
   - `src/core/channel.js`: `calculateNoiseSigma`, `applyAWGN`.
   - `src/core/theory.js`: `calculateTheoreticalBER`, `calculateRequiredEbN0`.
   - `src/core/link.js`: `calculateLinkBudget`.
   - `src/core/simulate.js`: Función pura `simulate(...)` Monte Carlo desacoplada del DOM.
   - `src/core/registry.js`: Registro de esquemas con principio Open/Closed.
   - `src/core/modulations/`: Estrategias individuales (`bpsk.js`, `qpsk.js`, `psk8.js`, `qam.js`).
2. **Optimizaciones aplicadas**:
   - Detector $O(1)$ por ejes para QAM (16-QAM y 64-QAM).
3. **Tests y Benchmarks**:
   - Creación de suite Vitest: `tests/golden.test.js`, `tests/unit/modulations.test.js`, `tests/unit/link.test.js`.
   - Total de 383 pruebas automatizadas pasando con éxito.
   - Medición de rendimiento en `docs/benchmarks.md` demostrando aceleración de $2.25\times$ en 64-QAM ($11.98\text{ ms}$ vs $\approx 27\text{ ms}$).

---

## [2026-10-24] - Pasos 4 y 5: Modularización de UI, Canvas, Web Worker y Estilos

### Acciones Realizadas
1. **Estilos Modulares (`src/styles/`)**:
   - Separación en `variables.css` (temas claro/oscuro), `layout.css` (grillas responsivas) y `components.css`.
2. **Renderizado en Canvas (`src/ui/canvas/`)**:
   - `common.js`: Escalado DPI automático (`devicePixelRatio`) y lectura reactiva de variables CSS.
   - `constellation.js`: Diagrama de constelación en plano $I/Q$.
   - `berCurve.js`: Curvas de probabilidad de error teórica vs empírica con escala semilogarítmica.
3. **Cálculo Asíncrono (`src/worker/`)**:
   - `simulation.worker.js`: Web Worker para simulación fuera del hilo principal.
   - `simulationService.js`: Despachador asíncrono con cancelación de solicitudes obsoletas y fallback transparente al hilo principal.
4. **Métricas y Formateo (`src/ui/`)**:
   - `formatters.js`: Formateo de tasas (Hz/símb/s), notación científica y números legibles en español.
   - `metricsRenderer.js`: Renderizado mediante `DocumentFragment` y manipulación DOM segura.
   - `main.js`: Controlador principal con `requestAnimationFrame`.
5. **CI/CD**:
   - Configuración de GitHub Actions en `.github/workflows/ci.yml`.
   - Documentación técnica completa en `docs/modelo-fisico.md`.

### Métodos de Verificación
- Ejecución completa de Vitest: 388/388 pruebas superadas (4 archivos de test).
- Compilación de producción con Vite (`npm run build`) completada con éxito en 241 ms.
