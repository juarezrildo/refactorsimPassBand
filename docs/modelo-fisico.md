# Modelo Físico y Matemático de la Simulación

Este documento describe la base teórica, deducciones analíticas y normalizaciones físicas implementadas en el simulador de modulaciones digitales paso banda sobre canal AWGN.

---

## 1. Representación en Banda Base Equivalente Compleja

Cualquier señal paso banda modulada linealmente puede representarse en su envolvente compleja equivalente:

$$s(t) = \text{Re}\left\{ s_{\text{bb}}(t) e^{j 2 \pi f_c t} \right\}$$

Donde el símbolo complejo transmitido en cada intervalo de señalización $T_s$ es:

$$s_m = s_{m,I} + j s_{m,Q}, \quad m \in \{0, 1, \dots, M-1\}$$

Al atravesar un canal con Ruido Blanco Gaussiano Aditivo (**AWGN**), la señal recibida en el detector coherente es:

$$r = s_m + n$$

Donde $n = n_I + j n_Q$ es una variable aleatoria gaussiana compleja circularmente simétrica ($\mathcal{CN}(0, 2\sigma^2)$), cuyas componentes en fase y cuadratura son estadísticamente independientes:

$$n_I \sim \mathcal{N}(0, \sigma^2), \quad n_Q \sim \mathcal{N}(0, \sigma^2)$$

---

## 2. Normalización de Energía y Varianza del Ruido

Para permitir una comparación justa e invariante entre diferentes órdenes de modulación ($M$):

1. **Energía media por símbolo normalizada:**
   $$E_s = \frac{1}{M} \sum_{m=0}^{M-1} \left( s_{m,I}^2 + s_{m,Q}^2 \right) = 1$$

2. **Energía media por bit:**
   $$E_b = \frac{E_s}{k} = \frac{1}{k}, \quad \text{con } k = \log_2(M)$$

3. **Densidad espectral de potencia del ruido ($N_0$):**
   Dado que la relación señal a ruido por bit se define como $\gamma_b = \frac{E_b}{N_0} = 10^{\frac{(E_b/N_0)_{\text{dB}}}{10}}$:
   $$N_0 = \frac{E_b}{\gamma_b} = \frac{1}{k \cdot \gamma_b}$$

4. **Desviación estándar del ruido por dimensión ($\sigma$):**
   La varianza del ruido por cada dimensión ortogonal es $\sigma^2 = \frac{N_0}{2}$:
   $$\sigma = \sqrt{\frac{N_0}{2}} = \sqrt{\frac{E_b}{2 \cdot \gamma_b}} = \sqrt{\frac{1}{2 k \cdot 10^{\frac{(E_b/N_0)_{\text{dB}}}{10}}}}$$

---

## 3. Geometría de las Constelaciones

### BPSK ($M = 2, k = 1$)
- Puntos en el plano real: $s_0 = (+1, 0)$ (etiqueta `0`), $s_1 = (-1, 0)$ (etiqueta `1`).
- Detección ML: Umbral en $x = 0$.

### QPSK ($M = 4, k = 2$)
- Desfase angular de $\frac{\pi}{4}$:
  $$s_i = \left( \cos\left( \frac{2\pi i}{4} + \frac{\pi}{4} \right), \sin\left( \frac{2\pi i}{4} + \frac{\pi}{4} \right) \right), \quad i \in \{0, 1, 2, 3\}$$
- Mapeo Gray: $l_i = i \oplus (i \gg 1)$.
- Detección ML: Cuadrantes cartesianos ortogonales (independientes en $I$ y $Q$).

### 8-PSK ($M = 8, k = 3$)
- Sin desfase ($\theta_0 = 0$):
  $$s_i = \left( \cos\left( \frac{2\pi i}{8} \right), \sin\left( \frac{2\pi i}{8} \right) \right), \quad i \in \{0, \dots, 7\}$$
- Mapeo Gray a lo largo del círculo unitario.

### $M$-QAM Cuadrada ($M \in \{16, 64\}$)
- Dimensión por eje: $L = \sqrt{M}$. Bits por dimensión: $h = k / 2$.
- Factor de escala para normalizar $E_s = 1$:
  $$s = \frac{1}{\sqrt{\frac{2(M - 1)}{3}}}$$
- Coordenadas de la grilla cartesiana para $i, j \in \{0, \dots, L - 1\}$:
  $$x_i = (2i - (L - 1)) \cdot s, \quad y_j = (2j - (L - 1)) \cdot s$$
- Etiqueta binaria (producto cartesiano de códigos de Gray):
  $$\text{etiqueta}(i, j) = (\text{gray}(i) \ll h) \mid \text{gray}(j)$$

---

## 4. Probabilidad Teórica de Error de Bit (BER)

La función de cola gaussiana se define como:
$$Q(x) = \frac{1}{\sqrt{2\pi}} \int_x^\infty e^{-u^2/2} \, du = \frac{1}{2} \text{erfc}\left( \frac{x}{\sqrt{2}} \right)$$

1. **BPSK y QPSK (exacta con mapeo Gray):**
   $$P_{b} = Q\left( \sqrt{2 \frac{E_b}{N_0}} \right)$$

2. **8-PSK (aproximación estándar para SNR moderada/alta):**
   $$P_b \approx \frac{2}{k} Q\left( \sqrt{2 k \frac{E_b}{N_0}} \sin\left( \frac{\pi}{M} \right) \right)$$

3. **$M$-QAM Cuadrada:**
   $$P_b \approx \frac{4}{k} \left( 1 - \frac{1}{\sqrt{M}} \right) Q\left( \sqrt{\frac{3 k}{M - 1} \frac{E_b}{N_0}} \right)$$

---

## 5. Parámetros de Enlace y Eficiencia Espectral

- **Tasa de símbolos:** $R_s = \frac{R_b}{k}$ (baudios).
- **Ancho de banda de Nyquist con pulso de coseno alzado (roll-off $\alpha$):**
  $$B = R_s (1 + \alpha)$$
- **Eficiencia espectral:**
  $$\eta = \frac{R_b}{B} = \frac{k}{1 + \alpha} \quad \left[ \frac{\text{bit/s}}{\text{Hz}} \right]$$
- **Relación $E_s/N_0$:**
  $$\left(\frac{E_s}{N_0}\right)_{\text{dB}} = \left(\frac{E_b}{N_0}\right)_{\text{dB}} + 10 \log_{10}(k)$$
