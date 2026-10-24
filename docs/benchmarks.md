# Registro de Rendimiento y Benchmarks

Este documento registra las métricas de rendimiento y comparación de tiempos de cómputo del motor de simulación.

---

## Benchmark de Simulación Monte Carlo (64-QAM, 100 000 símbolos)

- **Entorno:** Node.js v24.15.0 / Windows
- **Escenario:** 64-QAM, $E_b/N_0 = 14\text{ dB}$, $N = 100\,000$ símbolos (600 000 bits simulados).

### Resultados

| Versión | Detector | Tiempo promedio (10 corridas) | Factor de aceleración |
|---|---|---|---|
| **v1.0 (Original)** | Búsqueda exhaustiva $O(M)$ (64 evaluaciones de distancia euclidiana por símbolo) | $\approx 27.00\text{ ms}$ | $1.0\times$ (Línea base) |
| **v1.1 (Refactorizada)** | Detector ortogonal por ejes $O(1)$ | **$11.98\text{ ms}$** | **$2.25\times$ más rápido ($-55.6\%$)** |

### Precisión Numérica
- Decisiones diferentes frente al detector original en los 360 escenarios de prueba: **0**.
- Tasa de acierto frente a `tests/golden/v1.json`: **100% (361/361 tests superados)**.
