# Simulador de Modulaciones Digitales Paso Banda (Canal AWGN)

[![Node.js CI](https://img.shields.io/badge/Node.js-%E2%89%A520-brightgreen.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-FCC72B.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Simulador interactivo y profesional de sistemas de transmisión digital paso banda sobre canal con ruido blanco gaussiano aditivo (**AWGN**), desarrollado para la asignatura **Comunicaciones Digitales I (RED-0310)** en la **Universidad Privada Domingo Savio (UPDS)** por **Rildo Jimmy Juarez Romero**.

---

## 🚀 Características

- **Modulaciones soportadas:**
  - $M$-PSK: BPSK, QPSK ($\pi/4$ offset), 8-PSK.
  - $M$-QAM: 16-QAM y 64-QAM (con constelaciones cuadradas y mapeo Gray).
- **Modelo Físico Coherente:**
  - Detección ML (Mínima Distancia euclidiana) en banda base equivalente compleja.
  - Normalización rigurosa de energía media por símbolo ($E_s = 1$).
  - Ruido generado mediante transformada de Box-Muller con varianza por dimensión $\sigma = \sqrt{\frac{E_b}{2 \cdot E_b/N_0}}$.
- **Visualización en Tiempo Real:**
  - Diagrama de constelación en el plano $I/Q$ con identificación cromática de símbolos erróneos.
  - Curvas de probabilidad de error de bit ($BER$) teóricas vs. simulación Monte Carlo.
  - Balance de enlace: tasa de símbolos ($R_s$), ancho de banda de Nyquist ($B = (1+\alpha)R_s$), eficiencia espectral ($\eta$), y estimación de tiempo de transmisión para archivos.
- **Rendimiento y Determinismo:**
  - Generador pseudoaleatorio Mulberry32 reproducible por semilla.
  - Procesamiento asíncrono en Web Worker para evitar bloqueos en la interfaz gráfica.
  - Pruebas doradas (*Golden Tests*) con 360 escenarios de referencia garantizando fidelidad matemática absoluta.

---

## 📁 Estructura del Proyecto

```text
refactorsimPassBand/
├── original/                   # Versión original monolítica de referencia (solo lectura)
├── src/
│   ├── core/                   # Núcleo matemático puro y agnóstico a la UI
│   │   ├── rng.js              # PRNG Mulberry32 determinista
│   │   ├── gaussian.js         # Box-Muller
│   │   ├── special.js          # erfc, Q(x)
│   │   ├── channel.js          # Canal AWGN
│   │   ├── simulate.js         # Motor Monte Carlo
│   │   ├── theory.js           # Fórmulas analíticas y búsqueda de Eb/N0
│   │   ├── link.js             # Cálculos de tasa, ancho de banda y archivo
│   │   ├── registry.js         # Registro dinámico de esquemas
│   │   └── modulations/        # Estrategias por modulación (BPSK, QPSK, 8-PSK, QAM)
│   ├── worker/                 # Web Worker para cómputo en segundo plano
│   ├── ui/                     # Controladores de interfaz y Canvas (I/Q y BER)
│   └── styles/                 # Estilos CSS modulares (con soporte dark/light)
├── tests/                      # Suite de pruebas automatizadas (Vitest)
│   ├── golden/                 # Matriz de regresión con resultados de referencia
│   └── unit/                   # Tests unitarios de física y matemáticas
├── docs/                       # Documentación técnica, modelo físico y bitácora
└── scripts/                    # Utilidades de desarrollo (generación de datos dorados)
```

---

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js $\ge$ 20.x
- npm $\ge$ 10.x

### Clonar e instalar
```bash
git clone https://github.com/tu-usuario/refactorsimPassBand.git
cd refactorsimPassBand
npm install
```

### Comandos disponibles
- `npm run dev`: Inicia el servidor local de desarrollo con recarga rápida (HMR).
- `npm test`: Ejecuta la suite completa de pruebas unitarias y de regresión dorada con Vitest.
- `npm run golden`: Regenera los 360 escenarios de control contra el motor original.
- `npm run build`: Compila los archivos para producción.
- `npm run preview`: Previsualiza la versión de producción localmente.

---

## 📜 Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
