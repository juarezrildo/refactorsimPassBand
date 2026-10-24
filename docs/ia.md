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

## [2026-10-24] - Rediseño Visual Pro Max, Liquid Glass y Corrección de Curva BER

### Diagnóstico de la Card Vacía
- **Causa identificada:** Al desacoplar la simulación al Web Worker, el objeto `scheme` transferido por `postMessage` se serializa como un objeto plano sin sus métodos prototípicos (`scheme.berTheory`). Al invocar `calculateTheoreticalBER(simulationResult.scheme, g)`, fallaba silenciosamente dentro de `requestAnimationFrame`, interrumpiendo el dibujado de la gráfica BER y de las métricas.
- **Solución:** Se refactorizó `calculateTheoreticalBER` y `calculateRequiredEbN0` para resolver el esquema siempre a través del `registry.get(name)`, garantizando que el worker pueda devolver objetos serializables sin romper la ejecución.

### Overhaul Visual Aplicado
1. **Liquid Glass & Glassmorphism Tokens:**
   - Paneles translúcidos con `backdrop-filter: blur(20px) saturate(180%)`, bordes especulares y sombras multicapa.
   - Fondos radiales atmosféricos con brillos de acento cian/teal.
2. **Patrón Emil Kowalski:**
   - Selector de modulación segmentado (*Pill tabs*) con transición suave y estado activo resaltado.
   - Sliders de $E_b/N_0$ y $\alpha$ personalizados con pistas degradadas de progreso dinámico y thumbs brillantes.
   - Micro-interacciones táctiles en botones y controles.
3. **Canvas Gráfico de Alta Fidelidad (Pro Max):**
   - **Constelación I/Q:** Círculo guía de energía $E_s = 1$, ejes con flechas y tipografía nítida, puntos correctos en cian translúcido y errores en coral brillante.
   - **Curvas BER:** Eje logarítmico calibrado de $10^0$ a $10^{-6}$, curva activa destacada con halo, marcador vertical de $E_b/N_0$ y punto empírico.
4. **Deck de Métricas:**
   - 12 tarjetas KPI con etiquetas de categoría, valores en fuente monospace y notas descriptivas.
   - Panel de diagnóstico inteligente que clasifica el enlace en tiempo real (Fiable vs Degradado).
